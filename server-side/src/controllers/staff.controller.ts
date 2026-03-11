import { Request, Response } from "express";
import * as staffService from "../services/staff.service";
import { ApiError } from "../middleware/index";

/**
 * Staff Controllers
 * Handle HTTP requests and responses for staff-related operations
 */

// ─── Staff Details ────────────────────────────────────────────────────────────

/**
 * Get all staff members
 * @route GET /api/staff
 */
export const getAllStaffDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staff = await staffService.getAllStaffDetails();

  res.status(200).json({
    status: "success",
    staff,
    count: staff.length,
  });
};

/**
 * Get staff member by ID
 * @route GET /api/staff/:id
 */
export const getStaffById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = String(req.params.id);
  const staff = await staffService.getStaffById(parseInt(id));

  if (!staff) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({ status: "success", staff });
};

/**
 * Create new staff member
 * @route POST /api/staff
 */
export const createStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const newStaff = await staffService.createStaff(req.body);

  res.status(201).json({
    status: "success",
    message: "Staff member created successfully",
    data: newStaff,
  });
};

/**
 * Update staff member details
 * @route PUT /api/staff/:id
 */
export const updateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = String(req.params.id);
  const updatedStaff = await staffService.updateStaff(parseInt(id), req.body);

  if (!updatedStaff) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Staff member updated successfully",
    data: updatedStaff,
  });
};

/**
 * Delete staff member (cascades to their account)
 * @route DELETE /api/staff/:id
 */
export const deleteStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = String(req.params.id);
  const deleted = await staffService.deleteStaff(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Staff member deleted successfully",
  });
};

/**
 * Get staff by work type
 * @route GET /api/staff/work-type/:type
 */
export const getStaffByWorkType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const type = String(req.params.type);
  const staff = await staffService.getStaffByWorkType(type);

  res.status(200).json({
    status: "success",
    staff,
    count: staff.length,
  });
};

// ─── Staff Accounts ───────────────────────────────────────────────────────────

/**
 * Get all staff accounts
 * @route GET /api/staff/accounts
 */
export const getAllAccounts = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accounts = await staffService.getAllAccounts();

  res.status(200).json({
    status: "success",
    data: accounts,
    count: accounts.length,
  });
};

/**
 * Get a single account by ID
 * @route GET /api/staff/accounts/:accountId
 */
export const getAccountById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const account = await staffService.getAccountById(parseInt(accountId));

  if (!account) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  res.status(200).json({ status: "success", data: account });
};

/**
 * Get the account linked to a staff member
 * @route GET /api/staff/:id/account
 */
export const getAccountByStaffId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staffId = String(req.params.id);
  const account = await staffService.getAccountByStaffId(parseInt(staffId));

  if (!account) {
    throw new ApiError(
      404,
      `No account found for staff member with ID ${staffId}`,
    );
  }

  res.status(200).json({ status: "success", data: account });
};

/**
 * Create a staff account
 * @route POST /api/staff/accounts
 */
export const createAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const newAccount = await staffService.createAccount(req.body);

  res.status(201).json({
    status: "success",
    message: "Staff account created successfully",
    data: newAccount,
  });
};

/**
 * Update general account fields (username, work_email, department_id)
 * @route PUT /api/staff/accounts/:accountId
 */
export const updateAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const updatedAccount = await staffService.updateAccount(
    parseInt(accountId),
    req.body,
  );

  if (!updatedAccount) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Account updated successfully",
    data: updatedAccount,
  });
};

/**
 * Update account status (Active / Suspended)
 * @route PATCH /api/staff/accounts/:accountId/status
 */
export const updateAccountStatus = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const { status } = req.body;

  const updatedAccount = await staffService.updateAccountStatus(
    parseInt(accountId),
    status,
  );

  if (!updatedAccount) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  res.status(200).json({
    status: "success",
    message: `Account status updated to ${status}`,
    data: updatedAccount,
  });
};

/**
 * Update account role (Admin / Manager / Staff)
 * @route PATCH /api/staff/accounts/:accountId/role
 */
export const updateAccountRole = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const { role } = req.body;

  const updatedAccount = await staffService.updateAccountRole(
    parseInt(accountId),
    role,
  );

  if (!updatedAccount) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  res.status(200).json({
    status: "success",
    message: `Account role updated to ${role}`,
    data: updatedAccount,
  });
};

/**
 * Change account password (requires current password verification)
 * @route PATCH /api/staff/accounts/:accountId/password
 */
export const updateAccountPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const { current_password, new_password } = req.body;

  await staffService.updateAccountPassword(
    parseInt(accountId),
    current_password,
    new_password,
  );

  res.status(200).json({
    status: "success",
    message: "Password updated successfully",
  });
};

/**
 * Delete a staff account (keeps the staff_details row intact)
 * @route DELETE /api/staff/accounts/:accountId
 */
export const deleteAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const accountId = String(req.params.accountId);
  const deleted = await staffService.deleteAccount(parseInt(accountId));

  if (!deleted) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Staff account deleted successfully",
  });
};
