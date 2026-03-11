/**
 * Staff Service — SQL query strings
 *
 * Centralises all raw SQL used by staff.service.ts.
 */

// ─── Shared fragments ─────────────────────────────────────────────────────────

/** Full staff row joined with account and department — used by list and detail queries */
const STAFF_SELECT_FROM = `
  SELECT
    sd.staff_id,
    sd.staff_name,
    sd.work_type,
    sd.staff_role,
    sd.gender,
    sd.personal_email,
    sd.phone_number,
    sd.date_joined,
    sa.account_id,
    sa.username,
    sa.work_email,
    sa.status,
    sa.role,
    sa.department_id,
    d.department_name
  FROM staff_details sd
  LEFT JOIN staff_accounts sa ON sd.staff_id      = sa.staff_id
  LEFT JOIN departments    d  ON sa.department_id = d.department_id
`;

/** Full account row joined with staff name and department — used by account queries */
const ACCOUNT_SELECT_FROM = `
  SELECT
    sa.account_id,
    sa.staff_id,
    sd.staff_name,
    sd.staff_role,
    sa.username,
    sa.work_email,
    sa.status,
    sa.role,
    sa.department_id,
    d.department_name,
    sa.date_registered,
    sa.created_at,
    sa.updated_at
  FROM staff_accounts sa
  INNER JOIN staff_details sd ON sa.staff_id      = sd.staff_id
  LEFT  JOIN departments   d  ON sa.department_id = d.department_id
`;

// ─── Queries ──────────────────────────────────────────────────────────────────

export const STAFF_QUERIES = {
  // ── Staff Details ──────────────────────────────────────────────────────────

  /** Return all staff members with their linked account and department details */
  getAllStaff: `
    ${STAFF_SELECT_FROM}
    ORDER BY sd.staff_id DESC
  `,

  /** Return a single staff member by primary key with account and department details */
  getStaffById: `
    ${STAFF_SELECT_FROM}
    WHERE sd.staff_id = $1
  `,

  /** Check whether a personal email address is already registered */
  checkEmailExists: `
    SELECT staff_id
    FROM staff_details
    WHERE personal_email = $1
  `,

  /** Insert a new staff member and return all columns */
  createStaff: `
    INSERT INTO staff_details
      (staff_name, work_type, staff_role, gender, personal_email, phone_number, date_joined)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `,

  /**
   * Delete a staff member by primary key and return the deleted ID.
   * Cascades to staff_accounts due to ON DELETE CASCADE on the FK.
   */
  deleteStaff: `
    DELETE FROM staff_details
    WHERE staff_id = $1
    RETURNING staff_id
  `,

  /** Return all staff members filtered by work type with their account details */
  getStaffByWorkType: `
    SELECT
      sd.staff_id,
      sd.staff_name,
      sd.work_type,
      sd.staff_role,
      sd.gender,
      sd.personal_email,
      sd.phone_number,
      sd.date_joined,
      sa.account_id,
      sa.username,
      sa.work_email,
      sa.status,
      sa.role
    FROM staff_details sd
    LEFT JOIN staff_accounts sa ON sd.staff_id = sa.staff_id
    WHERE sd.work_type = $1
    ORDER BY sd.staff_id DESC
  `,

  // ── Staff Accounts ─────────────────────────────────────────────────────────

  /** Return all staff accounts with staff name and department */
  getAllAccounts: `
    ${ACCOUNT_SELECT_FROM}
    ORDER BY sa.account_id DESC
  `,

  /** Return a single account by its primary key */
  getAccountById: `
    ${ACCOUNT_SELECT_FROM}
    WHERE sa.account_id = $1
  `,

  /** Return the account linked to a given staff_id */
  getAccountByStaffId: `
    ${ACCOUNT_SELECT_FROM}
    WHERE sa.staff_id = $1
  `,

  /** Check whether a username is already taken */
  checkUsernameExists: `
    SELECT account_id
    FROM staff_accounts
    WHERE username = $1
  `,

  /** Check whether a work email is already taken */
  checkWorkEmailExists: `
    SELECT account_id
    FROM staff_accounts
    WHERE work_email = $1
  `,

  /** Check whether a username is taken by a different account (used during updates) */
  checkUsernameExistsExcluding: `
    SELECT account_id
    FROM staff_accounts
    WHERE username = $1
      AND account_id != $2
  `,

  /** Check whether a work email is taken by a different account (used during updates) */
  checkWorkEmailExistsExcluding: `
    SELECT account_id
    FROM staff_accounts
    WHERE work_email = $1
      AND account_id != $2
  `,

  /** Verify that a staff_id exists before creating an account for them */
  checkStaffExists: `
    SELECT staff_id
    FROM staff_details
    WHERE staff_id = $1
  `,

  /** Check whether a staff member already has an account */
  checkAccountExistsForStaff: `
    SELECT account_id
    FROM staff_accounts
    WHERE staff_id = $1
  `,

  /** Verify that a department exists before assigning it to an account */
  checkDepartmentExists: `
    SELECT department_id
    FROM departments
    WHERE department_id = $1
  `,

  /**
   * Insert a new staff account and return all safe columns (excludes password_hash)
   */
  createAccount: `
    INSERT INTO staff_accounts
      (staff_id, username, work_email, password_hash, status, role, department_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      account_id, staff_id, username, work_email,
      status, role, department_id, date_registered, created_at, updated_at
  `,

  /** Update account status (Active / Suspended) */
  updateAccountStatus: `
    UPDATE staff_accounts
    SET status = $1, updated_at = CURRENT_TIMESTAMP
    WHERE account_id = $2
    RETURNING
      account_id, staff_id, username, work_email,
      status, role, department_id, date_registered, created_at, updated_at
  `,

  /** Update account role (Admin / Manager / Staff) */
  updateAccountRole: `
    UPDATE staff_accounts
    SET role = $1, updated_at = CURRENT_TIMESTAMP
    WHERE account_id = $2
    RETURNING
      account_id, staff_id, username, work_email,
      status, role, department_id, date_registered, created_at, updated_at
  `,

  /** Update the password hash for an account */
  updateAccountPassword: `
    UPDATE staff_accounts
    SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
    WHERE account_id = $2
    RETURNING account_id
  `,

  /** Fetch the current password hash for an account (used to verify old password) */
  getAccountPasswordHash: `
    SELECT password_hash
    FROM staff_accounts
    WHERE account_id = $1
  `,

  /** Delete a staff account by primary key and return the deleted ID */
  deleteAccount: `
    DELETE FROM staff_accounts
    WHERE account_id = $1
    RETURNING account_id
  `,

  /** Return all accounts filtered by status */
  getAccountsByStatus: `
    ${ACCOUNT_SELECT_FROM}
    WHERE sa.status = $1
    ORDER BY sa.account_id DESC
  `,

  /** Return all accounts filtered by role */
  getAccountsByRole: `
    ${ACCOUNT_SELECT_FROM}
    WHERE sa.role = $1
    ORDER BY sa.account_id DESC
  `,
} as const;
