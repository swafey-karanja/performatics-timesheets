import bcrypt from "bcryptjs";
import { pool } from "../config/database";
import { ApiError } from "../middleware";
import { STAFF_QUERIES } from "../queries/staff.queries";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

// ─── Types ────────────────────────────────────────────────────────────────────

export type AccountStatus = "Active" | "Suspended";
export type AccountRole = "Admin" | "Manager" | "Staff";

export interface StaffDetails {
  staff_id?: number;
  staff_name: string;
  work_type: "Employment" | "Consultancy" | "Internship";
  staff_role: string;
  gender?: "Male" | "Female";
  personal_email: string;
  phone_number?: string;
  date_joined: string;
}

export interface StaffWithAccount extends StaffDetails {
  account_id?: number;
  username?: string;
  work_email?: string;
  status?: AccountStatus;
  role?: AccountRole;
  department_id?: number;
  department_name?: string;
}

export interface StaffAccount {
  account_id: number;
  staff_id: number;
  staff_name: string;
  staff_role: string;
  username: string;
  work_email: string;
  status: AccountStatus;
  role: AccountRole;
  department_id: number | null;
  department_name: string | null;
  date_registered: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountInput {
  staff_id: number;
  username: string;
  work_email: string;
  password: string;
  status?: AccountStatus;
  role?: AccountRole;
  department_id?: number | null;
}

export interface UpdateAccountInput {
  username?: string;
  work_email?: string;
  department_id?: number | null;
}

// ─── Staff Details ────────────────────────────────────────────────────────────

/**
 * Get all staff members with their account details
 */
export const getAllStaffDetails = async (): Promise<StaffWithAccount[]> => {
  const result = await pool.query(STAFF_QUERIES.getAllStaff);
  return result.rows;
};

/**
 * Get staff member by ID
 */
export const getStaffById = async (
  staffId: number,
): Promise<StaffWithAccount | null> => {
  const result = await pool.query(STAFF_QUERIES.getStaffById, [staffId]);
  return result.rows[0] ?? null;
};

/**
 * Create new staff member
 */
export const createStaff = async (
  staffData: StaffDetails,
): Promise<StaffDetails> => {
  const {
    staff_name,
    work_type,
    staff_role,
    gender,
    personal_email,
    phone_number,
    date_joined,
  } = staffData;

  const validWorkTypes = ["Employment", "Consultancy", "Internship"];
  if (!validWorkTypes.includes(work_type)) {
    throw new ApiError(
      400,
      `Invalid work type. Must be one of: ${validWorkTypes.join(", ")}`,
    );
  }

  const emailCheck = await pool.query(STAFF_QUERIES.checkEmailExists, [
    personal_email,
  ]);
  if (emailCheck.rows.length > 0) {
    throw new ApiError(400, "Personal email already exists");
  }

  const result = await pool.query(STAFF_QUERIES.createStaff, [
    staff_name,
    work_type,
    staff_role,
    gender || null,
    personal_email,
    phone_number || null,
    date_joined,
  ]);

  return result.rows[0];
};

/**
 * Update staff member details
 */
export const updateStaff = async (
  staffId: number,
  staffData: Partial<StaffDetails>,
): Promise<StaffDetails | null> => {
  const existingStaff = await getStaffById(staffId);
  if (!existingStaff) return null;

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(staffData).forEach(([key, value]) => {
    if (value !== undefined && key !== "staff_id") {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(staffId);

  const updateQuery = `
    UPDATE staff_details
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE staff_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};

/**
 * Delete a staff member (cascades to their account via FK)
 */
export const deleteStaff = async (staffId: number): Promise<boolean> => {
  const result = await pool.query(STAFF_QUERIES.deleteStaff, [staffId]);
  return (result.rowCount ?? 0) > 0;
};

/**
 * Get staff by work type
 */
export const getStaffByWorkType = async (
  workType: string,
): Promise<StaffWithAccount[]> => {
  const result = await pool.query(STAFF_QUERIES.getStaffByWorkType, [workType]);
  return result.rows;
};

// ─── Staff Accounts ───────────────────────────────────────────────────────────

/**
 * Get all staff accounts
 */
export const getAllAccounts = async (): Promise<StaffAccount[]> => {
  const result = await pool.query(STAFF_QUERIES.getAllAccounts);
  return result.rows;
};

/**
 * Get a single account by its ID
 */
export const getAccountById = async (
  accountId: number,
): Promise<StaffAccount | null> => {
  const result = await pool.query(STAFF_QUERIES.getAccountById, [accountId]);
  return result.rows[0] ?? null;
};

/**
 * Get the account linked to a staff member
 */
export const getAccountByStaffId = async (
  staffId: number,
): Promise<StaffAccount | null> => {
  const result = await pool.query(STAFF_QUERIES.getAccountByStaffId, [staffId]);
  return result.rows[0] ?? null;
};

/**
 * Create a new staff account (hashes the password before storing)
 */
export const createAccount = async (
  input: CreateAccountInput,
): Promise<StaffAccount> => {
  const {
    staff_id,
    username,
    work_email,
    password,
    status = "Active",
    role = "Staff",
    department_id = null,
  } = input;

  // Verify the staff member exists
  const staffCheck = await pool.query(STAFF_QUERIES.checkStaffExists, [
    staff_id,
  ]);
  if (staffCheck.rows.length === 0) {
    throw new ApiError(404, `Staff member with ID ${staff_id} not found`);
  }

  // One staff member, one account
  const existingAccount = await pool.query(
    STAFF_QUERIES.checkAccountExistsForStaff,
    [staff_id],
  );
  if (existingAccount.rows.length > 0) {
    throw new ApiError(
      409,
      `Staff member with ID ${staff_id} already has an account`,
    );
  }

  // Uniqueness checks
  const usernameCheck = await pool.query(STAFF_QUERIES.checkUsernameExists, [
    username,
  ]);
  if (usernameCheck.rows.length > 0) {
    throw new ApiError(409, "Username is already taken");
  }

  const emailCheck = await pool.query(STAFF_QUERIES.checkWorkEmailExists, [
    work_email,
  ]);
  if (emailCheck.rows.length > 0) {
    throw new ApiError(409, "Work email is already registered");
  }

  // Validate department if provided
  if (department_id !== null) {
    const deptCheck = await pool.query(STAFF_QUERIES.checkDepartmentExists, [
      department_id,
    ]);
    if (deptCheck.rows.length === 0) {
      throw new ApiError(400, `Department with ID ${department_id} not found`);
    }
  }

  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await pool.query(STAFF_QUERIES.createAccount, [
    staff_id,
    username,
    work_email,
    password_hash,
    status,
    role,
    department_id,
  ]);

  return result.rows[0];
};

/**
 * Update general account fields (username, work_email, department_id).
 * Status, role, and password each have dedicated functions below.
 */
export const updateAccount = async (
  accountId: number,
  data: UpdateAccountInput,
): Promise<StaffAccount | null> => {
  const existing = await getAccountById(accountId);
  if (!existing) return null;

  if (data.username) {
    const check = await pool.query(STAFF_QUERIES.checkUsernameExistsExcluding, [
      data.username,
      accountId,
    ]);
    if (check.rows.length > 0) {
      throw new ApiError(409, "Username is already taken");
    }
  }

  if (data.work_email) {
    const check = await pool.query(
      STAFF_QUERIES.checkWorkEmailExistsExcluding,
      [data.work_email, accountId],
    );
    if (check.rows.length > 0) {
      throw new ApiError(409, "Work email is already registered");
    }
  }

  if (data.department_id !== undefined && data.department_id !== null) {
    const deptCheck = await pool.query(STAFF_QUERIES.checkDepartmentExists, [
      data.department_id,
    ]);
    if (deptCheck.rows.length === 0) {
      throw new ApiError(
        400,
        `Department with ID ${data.department_id} not found`,
      );
    }
  }

  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(accountId);

  const updateQuery = `
    UPDATE staff_accounts
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE account_id = $${paramCount}
    RETURNING
      account_id, staff_id, username, work_email,
      status, role, department_id, date_registered, created_at, updated_at
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};

/**
 * Update an account's status (Active / Suspended)
 */
export const updateAccountStatus = async (
  accountId: number,
  status: AccountStatus,
): Promise<StaffAccount | null> => {
  const existing = await getAccountById(accountId);
  if (!existing) return null;

  const validStatuses: AccountStatus[] = ["Active", "Suspended"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    );
  }

  const result = await pool.query(STAFF_QUERIES.updateAccountStatus, [
    status,
    accountId,
  ]);
  return result.rows[0];
};

/**
 * Update an account's role (Admin / Manager / Staff)
 */
export const updateAccountRole = async (
  accountId: number,
  role: AccountRole,
): Promise<StaffAccount | null> => {
  const existing = await getAccountById(accountId);
  if (!existing) return null;

  const validRoles: AccountRole[] = ["Admin", "Manager", "Staff"];
  if (!validRoles.includes(role)) {
    throw new ApiError(
      400,
      `Invalid role. Must be one of: ${validRoles.join(", ")}`,
    );
  }

  const result = await pool.query(STAFF_QUERIES.updateAccountRole, [
    role,
    accountId,
  ]);
  return result.rows[0];
};

/**
 * Change the password for an account.
 * Verifies the current password before applying the update.
 */
export const updateAccountPassword = async (
  accountId: number,
  currentPassword: string,
  newPassword: string,
): Promise<void> => {
  const hashResult = await pool.query(STAFF_QUERIES.getAccountPasswordHash, [
    accountId,
  ]);

  if (hashResult.rows.length === 0) {
    throw new ApiError(404, `Account with ID ${accountId} not found`);
  }

  const isMatch = await bcrypt.compare(
    currentPassword,
    hashResult.rows[0].password_hash,
  );
  if (!isMatch) {
    throw new ApiError(400, "Current password is incorrect");
  }

  const newHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  await pool.query(STAFF_QUERIES.updateAccountPassword, [newHash, accountId]);
};

/**
 * Delete a staff account (does not delete the staff_details row)
 */
export const deleteAccount = async (accountId: number): Promise<boolean> => {
  const result = await pool.query(STAFF_QUERIES.deleteAccount, [accountId]);
  return (result.rowCount ?? 0) > 0;
};
