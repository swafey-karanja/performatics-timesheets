import { pool } from "../config/database";
import { ApiError } from "../middleware";
import { DEPARTMENT_QUERIES } from "../queries/department.queries";

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
  const result = await pool.query(DEPARTMENT_QUERIES.getAllDepartments);
  return result.rows;
};

/**
 * Get department by ID
 */
export const getDepartmentById = async (
  departmentId: number,
): Promise<DepartmentWithHead | null> => {
  const result = await pool.query(DEPARTMENT_QUERIES.getDepartmentById, [
    departmentId,
  ]);
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
    DEPARTMENT_QUERIES.checkDepartmentNameExists,
    [department_name],
  );
  if (nameCheck.rows.length > 0) {
    throw new ApiError(400, "Department name already exists");
  }

  // Verify department head exists
  const headCheck = await pool.query(
    DEPARTMENT_QUERIES.checkDepartmentHeadExists,
    [department_head_id],
  );
  if (headCheck.rows.length === 0) {
    throw new ApiError(400, "Department head account ID does not exist");
  }

  const result = await pool.query(DEPARTMENT_QUERIES.createDepartment, [
    department_name,
    department_head_id,
  ]);

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

  // If updating name, check uniqueness against other departments
  if (departmentData.department_name) {
    const nameCheck = await pool.query(
      DEPARTMENT_QUERIES.checkDepartmentNameExistsExcluding,
      [departmentData.department_name, departmentId],
    );
    if (nameCheck.rows.length > 0) {
      throw new ApiError(400, "Department name already exists");
    }
  }

  // If updating head, verify they exist
  if (departmentData.department_head_id) {
    const headCheck = await pool.query(
      DEPARTMENT_QUERIES.checkDepartmentHeadExists,
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

  const updateQuery = `
    UPDATE departments
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE department_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);
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
    DEPARTMENT_QUERIES.checkDepartmentHasStaff,
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
    DEPARTMENT_QUERIES.checkDepartmentHasTimesheets,
    [departmentId],
  );
  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete department with existing timesheet entries.",
    );
  }

  const result = await pool.query(DEPARTMENT_QUERIES.deleteDepartment, [
    departmentId,
  ]);
  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get all staff in a department
 */
export const getDepartmentStaff = async (
  departmentId: number,
): Promise<any[]> => {
  const result = await pool.query(DEPARTMENT_QUERIES.getDepartmentStaff, [
    departmentId,
  ]);
  return result.rows;
};
