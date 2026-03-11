/**
 * Department Service — SQL query strings
 *
 * Centralises all raw SQL used by department.service.ts.
 */

/** Shared SELECT + JOIN fragment reused by list and single-record queries */
const DEPARTMENT_SELECT_FROM = `
  SELECT
    d.department_id,
    d.department_name,
    d.department_head_id,
    d.created_at,
    d.updated_at,
    sd.staff_name       AS department_head_name,
    COUNT(DISTINCT sd_members.staff_id) AS staff_count
  FROM departments d
  INNER JOIN staff_details sd         ON d.department_head_id = sd.staff_id
  LEFT  JOIN staff_details sd_members ON d.department_id      = sd_members.department_id
`;

const DEPARTMENT_GROUP_BY = `
  GROUP BY
    d.department_id,
    d.department_name,
    d.department_head_id,
    d.created_at,
    d.updated_at,
    sd.staff_name
`;

export const DEPARTMENT_QUERIES = {
  /**
   * Return all departments with department head name and member count
   */
  getAllDepartments: `
    ${DEPARTMENT_SELECT_FROM}
    ${DEPARTMENT_GROUP_BY}
    ORDER BY d.department_name
  `,

  /**
   * Return a single department by primary key with head name and member count
   */
  getDepartmentById: `
    ${DEPARTMENT_SELECT_FROM}
    WHERE d.department_id = $1
    ${DEPARTMENT_GROUP_BY}
  `,

  /**
   * Check whether a department name is already taken
   */
  checkDepartmentNameExists: `
    SELECT department_id
    FROM departments
    WHERE department_name = $1
  `,

  /**
   * Check whether a department name is taken by a different department (used during updates)
   */
  checkDepartmentNameExistsExcluding: `
    SELECT department_id
    FROM departments
    WHERE department_name = $1
      AND department_id != $2
  `,

  /**
   * Verify that a staff account exists to serve as department head
   */
  checkDepartmentHeadExists: `
    SELECT account_id
    FROM staff_accounts
    WHERE account_id = $1
  `,

  /**
   * Insert a new department and return all columns
   */
  createDepartment: `
    INSERT INTO departments (department_name, department_head_id)
    VALUES ($1, $2)
    RETURNING *
  `,

  /**
   * Check whether staff accounts are assigned to a department (used before deletion)
   */
  checkDepartmentHasStaff: `
    SELECT COUNT(*) AS count
    FROM staff_accounts
    WHERE department_id = $1
  `,

  /**
   * Check whether timesheet entries reference a department (used before deletion)
   */
  checkDepartmentHasTimesheets: `
    SELECT COUNT(*) AS count
    FROM timesheets
    WHERE department_id = $1
  `,

  /**
   * Delete a department by primary key and return the deleted ID
   */
  deleteDepartment: `
    DELETE FROM departments
    WHERE department_id = $1
    RETURNING department_id
  `,

  /**
   * Return all staff members assigned to a department with their account details
   */
  getDepartmentStaff: `
    SELECT
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      sd.work_type,
      sa.work_email,
      sa.status
    FROM staff_accounts sa
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    WHERE sa.department_id = $1
    ORDER BY sd.staff_name
  `,
} as const;
