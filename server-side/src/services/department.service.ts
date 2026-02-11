import { pool } from "../config/database";
import { ApiError } from "../middleware";

/**
 * Department Service
 * Contains business logic for department operations
 */

export interface Department {
  department_id?: number;
  department_name: string;
  department_head_id: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface DepartmentWithHead extends Department {
  department_head_name?: string;
  department_head_email?: string;
  staff_count?: number;
}

/**
 * Get all departments with their head details
 */
export const getAllDepartments = async (): Promise<DepartmentWithHead[]> => {
  const query = `
    SELECT 
      d.department_id,
      d.department_name,
      d.department_head_id,
      d.created_at,
      d.updated_at,
      sd.staff_name AS department_head_name,
      sa.work_email AS department_head_email,
      COUNT(DISTINCT sa_members.account_id) AS staff_count
    FROM departments d
    INNER JOIN staff_accounts sa ON d.department_head_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN staff_accounts sa_members ON d.department_id = sa_members.department_id
    GROUP BY 
      d.department_id, 
      d.department_name, 
      d.department_head_id,
      d.created_at,
      d.updated_at,
      sd.staff_name,
      sa.work_email
    ORDER BY d.department_name
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (
  departmentId: number,
): Promise<DepartmentWithHead | null> => {
  const query = `
    SELECT 
      d.department_id,
      d.department_name,
      d.department_head_id,
      d.created_at,
      d.updated_at,
      sd.staff_name AS department_head_name,
      sa.work_email AS department_head_email,
      COUNT(DISTINCT sa_members.account_id) AS staff_count
    FROM departments d
    INNER JOIN staff_accounts sa ON d.department_head_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN staff_accounts sa_members ON d.department_id = sa_members.department_id
    WHERE d.department_id = $1
    GROUP BY 
      d.department_id, 
      d.department_name, 
      d.department_head_id,
      d.created_at,
      d.updated_at,
      sd.staff_name,
      sa.work_email
  `;

  const result = await pool.query(query, [departmentId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new department
 */
export const createDepartment = async (
  departmentData: Department,
): Promise<Department> => {
  const { department_name, department_head_id } = departmentData;

  // Check if department name already exists
  const nameCheck = await pool.query(
    "SELECT department_id FROM departments WHERE department_name = $1",
    [department_name],
  );

  if (nameCheck.rows.length > 0) {
    throw new ApiError(400, "Department name already exists");
  }

  // Verify department head exists
  const headCheck = await pool.query(
    "SELECT account_id FROM staff_accounts WHERE account_id = $1",
    [department_head_id],
  );

  if (headCheck.rows.length === 0) {
    throw new ApiError(400, "Department head account ID does not exist");
  }

  const query = `
    INSERT INTO departments (department_name, department_head_id)
    VALUES ($1, $2)
    RETURNING *
  `;

  const values = [department_name, department_head_id];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update department
 */
export const updateDepartment = async (
  departmentId: number,
  departmentData: Partial<Department>,
): Promise<Department | null> => {
  // Check if department exists
  const existingDepartment = await getDepartmentById(departmentId);
  if (!existingDepartment) {
    return null;
  }

  // If updating name, check uniqueness
  if (departmentData.department_name) {
    const nameCheck = await pool.query(
      "SELECT department_id FROM departments WHERE department_name = $1 AND department_id != $2",
      [departmentData.department_name, departmentId],
    );

    if (nameCheck.rows.length > 0) {
      throw new ApiError(400, "Department name already exists");
    }
  }

  // If updating head, verify they exist
  if (departmentData.department_head_id) {
    const headCheck = await pool.query(
      "SELECT account_id FROM staff_accounts WHERE account_id = $1",
      [departmentData.department_head_id],
    );

    if (headCheck.rows.length === 0) {
      throw new ApiError(400, "Department head account ID does not exist");
    }
  }

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(departmentData).forEach(([key, value]) => {
    if (value !== undefined && key !== "department_id") {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(departmentId);

  const query = `
    UPDATE departments 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE department_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete department
 */
export const deleteDepartment = async (
  departmentId: number,
): Promise<boolean> => {
  // Check if department has staff members
  const staffCheck = await pool.query(
    "SELECT COUNT(*) FROM staff_accounts WHERE department_id = $1",
    [departmentId],
  );

  if (parseInt(staffCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete department with assigned staff members. Reassign staff first.",
    );
  }

  // Check if department has timesheets
  const timesheetCheck = await pool.query(
    "SELECT COUNT(*) FROM timesheets WHERE department_id = $1",
    [departmentId],
  );

  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete department with existing timesheet entries.",
    );
  }

  const result = await pool.query(
    "DELETE FROM departments WHERE department_id = $1 RETURNING department_id",
    [departmentId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get all staff in a department
 */
export const getDepartmentStaff = async (
  departmentId: number,
): Promise<any[]> => {
  const query = `
    SELECT 
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      sd.work_type,
      sa.account_id,
      sa.username,
      sa.work_email,
      sa.status
    FROM staff_accounts sa
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    WHERE sa.department_id = $1
    ORDER BY sd.staff_name
  `;

  const result = await pool.query(query, [departmentId]);
  return result.rows;
};
