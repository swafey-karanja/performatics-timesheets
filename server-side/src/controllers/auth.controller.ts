import { Request, Response } from "express";
import * as authService from "../services/auth.service";

/**
 * POST /api/auth/register
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  const account = await authService.createAccount(req.body);

  res.status(201).json({
    success: true,
    message: "Account created successfully",
    data: account,
  });
};

/**
 * POST /api/auth/login
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: result,
  });
};

/**
 * POST /api/auth/refresh
 */
export const refresh = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    res
      .status(400)
      .json({ success: false, message: "Refresh token is required" });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);

  res.status(200).json({
    success: true,
    message: "Token refreshed successfully",
    data: result,
  });
};

/**
 * GET /api/auth/me  (protected)
 */
export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const account = await authService.getAccountById(req.user!.account_id);

  if (!account) {
    res.status(404).json({ success: false, message: "Account not found" });
    return;
  }

  res.status(200).json({ success: true, data: account });
};

/**
 * POST /api/auth/logout  (stateless — client discards token)
 */
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};
