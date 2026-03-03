import { useState } from "react";
import { login } from "@/services/authService";
import { useRouter } from "next/navigation";
import { LoginInput, LoginResponse } from "@/types/types";
import { setCookie } from "@/lib/utils";

// Parse "8h" / "7d" into hours for cookie expiry
const parseExpiryToHours = (expiresIn: string): number => {
  if (expiresIn.endsWith("h")) return parseInt(expiresIn);
  if (expiresIn.endsWith("d")) return parseInt(expiresIn) * 24;
  return 8; // fallback
};
export function useLogin() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (input: LoginInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response: LoginResponse = await login(input);

      if (!response.success) {
        throw new Error(response.message);
      }

      const { accessToken, refreshToken, expiresIn } = response.data.tokens;
      const account = response.data.account;
      const accessExpiryHours = parseExpiryToHours(expiresIn);

      // ── localStorage ────────────────────────────────────────────
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      localStorage.setItem("account", JSON.stringify(account));

      // ── Cookies ─────────────────────────────────────────────────
      setCookie("accessToken", accessToken, accessExpiryHours);
      setCookie("refreshToken", refreshToken, 7 * 24); // 7 days
      setCookie("userRole", account.role, accessExpiryHours);
      setCookie("accountId", String(account.account_id), accessExpiryHours);

      //   router.push("/dashboard");
    } catch (err: unknown) {
      setError((err as Error).message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
}
