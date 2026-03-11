import { getAllStaff, getAllStaffAccounts } from "@/services/staffService";
import { Staff, StaffAccount } from "@/types/types";
import useSWR from "swr";

/**
 * Hook to fetch all staff members
 */
export function useStaff() {
  const { data, error, isLoading, mutate } = useSWR<Staff[]>(
    "all-staff", // Use a simple key instead of URL
    getAllStaff,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    staff: data || [],
    isLoading,
    error,
    mutate
  };
}


/**
 * Fetches all staff accounts from GET /api/staff/accounts
 */
export function useStaffAccounts () {
  const { data, error, isLoading, mutate } = useSWR<StaffAccount[]>(
    "all-staff-accounts", 
    getAllStaffAccounts, 
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    accounts: data ?? [],
    isLoading,
    error: error as Error | undefined,
    mutate,
  };
};
