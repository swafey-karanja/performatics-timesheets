/**
 * Auth Service — SQL query strings
 *
 * Centralises all raw SQL used by auth.service.ts.
 */

export const AUTH_QUERIES = {
  /**
   * Verify a staff_id exists in staff_details
   */
  checkStaffExists: `
    SELECT staff_id
    FROM staff_details
    WHERE staff_id = $1
  `,

  /**
   * Check for duplicate username or work_email before account creation
   */
  checkDuplicateAccount: `
    SELECT account_id
    FROM staff_accounts
    WHERE username = $1 OR work_email = $2
  `,

  /**
   * Insert a new staff account and return all safe columns (excludes password_hash)
   */
  createAccount: `
    INSERT INTO staff_accounts
      (staff_id, username, work_email, password_hash, department_id, role)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING
      account_id, staff_id, username, work_email, status,
      department_id, role, date_registered, created_at, updated_at
  `,

  /**
   * Fetch a full account row by username or work_email (used during login)
   */
  getAccountByUsernameOrEmail: `
    SELECT *
    FROM staff_accounts
    WHERE username = $1 OR work_email = $2
  `,

  /**
   * Fetch account details needed to issue a refreshed token set
   */
  getAccountForRefresh: `
    SELECT account_id, staff_id, username, work_email, department_id, status
    FROM staff_accounts
    WHERE account_id = $1
  `,

  /**
   * Fetch a public account profile by primary key (excludes password_hash)
   */
  getAccountById: `
    SELECT
      account_id, staff_id, username, work_email, status,
      department_id, date_registered, created_at, updated_at
    FROM staff_accounts
    WHERE account_id = $1
  `,
} as const;
