import bcrypt from "bcryptjs";
import { query } from "../config/database";
import { generateTokens, verifyRefreshToken } from "../utils/jwt";
import {
  CreateAccountInput,
  LoginInput,
  AuthResponse,
  StaffAccount,
  JwtPayload,
} from "../types/types";

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || "12", 10);

/**
 * Create a new staff account
 */
export const createAccount = async (
  input: CreateAccountInput,
): Promise<Omit<StaffAccount, "password_hash">> => {
  const {
    staff_id,
    username,
    work_email,
    password,
    department_id,
    role = "Staff",
  } = input;

  // Verify the staff_id exists
  const staffCheck = await query(
    "SELECT staff_id FROM staff_details WHERE staff_id = $1",
    [staff_id],
  );
  if (staffCheck.rows.length === 0) {
    throw new Error("Staff member not found");
  }

  // Check for duplicate username or email
  const duplicateCheck = await query(
    "SELECT account_id FROM staff_accounts WHERE username = $1 OR work_email = $2",
    [username, work_email],
  );
  if (duplicateCheck.rows.length > 0) {
    throw new Error("Username or work email already exists");
  }

  // Hash password
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const result = await query(
    `INSERT INTO staff_accounts 
      (staff_id, username, work_email, password_hash, department_id, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING account_id, staff_id, username, work_email, status,
        department_id, role, date_registered, created_at, updated_at`,
    [
      staff_id,
      username,
      work_email,
      password_hash,
      department_id ?? null,
      role,
    ],
  );

  return result.rows[0];
};

/**
 * Login with username or work_email + password
 */
export const login = async (input: LoginInput): Promise<AuthResponse> => {
  const { username, work_email, password } = input;

  if (!username && !work_email) {
    throw new Error("Username or work email is required");
  }

  // Fetch account
  const result = await query(
    `SELECT * FROM staff_accounts 
     WHERE username = $1 OR work_email = $2`,
    [username ?? null, work_email ?? null],
  );

  if (result.rows.length === 0) {
    throw new Error("Invalid credentials");
  }

  const account: StaffAccount = result.rows[0];

  // Check account status
  if (account.status === "Suspended") {
    throw new Error("Account is suspended. Please contact your administrator.");
  }

  // Verify password
  const passwordMatch = await bcrypt.compare(password, account.password_hash);
  if (!passwordMatch) {
    throw new Error("Invalid credentials");
  }

  // Build token payload
  const payload: JwtPayload = {
    account_id: account.account_id,
    staff_id: account.staff_id,
    username: account.username,
    work_email: account.work_email,
    department_id: account.department_id,
    status: account.status,
    role: account.role,
  };

  const tokens = generateTokens(payload);

  // Return account without password_hash
  const { password_hash, ...safeAccount } = account;

  return { account: safeAccount, tokens };
};

/**
 * Refresh access token using refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string,
): Promise<Pick<AuthResponse, "tokens">> => {
  const decoded = verifyRefreshToken(refreshToken);

  const result = await query(
    `SELECT account_id, staff_id, username, work_email, department_id, status
     FROM staff_accounts WHERE account_id = $1`,
    [decoded.account_id],
  );

  if (result.rows.length === 0) {
    throw new Error("Account not found");
  }

  const account = result.rows[0];

  if (account.status === "Suspended") {
    throw new Error("Account is suspended");
  }

  const tokens = generateTokens(account as JwtPayload);
  return { tokens };
};

/**
 * Get account by ID (for profile endpoint)
 */
export const getAccountById = async (
  account_id: number,
): Promise<Omit<StaffAccount, "password_hash"> | null> => {
  const result = await query(
    `SELECT account_id, staff_id, username, work_email, status,
            department_id, date_registered, created_at, updated_at
     FROM staff_accounts WHERE account_id = $1`,
    [account_id],
  );

  return result.rows[0] ?? null;
};
