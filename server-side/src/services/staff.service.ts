import { pool } from "../config/database";
import { ApiError } from "../middleware";

/**
 * Staff Service
 * Contains business logic for staff operations
 */

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
  status?: "Active" | "Suspended";
  department_id?: number;
  department_name?: string;
}

/**
 * Get all staff members with their account details
 */
export const getAllStaff = async (): Promise<StaffWithAccount[]> => {
  const query = `
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
      sa.department_id,
      d.department_name
    FROM staff_details sd
    LEFT JOIN staff_accounts sa ON sd.staff_id = sa.staff_id
    LEFT JOIN departments d ON sa.department_id = d.department_id
    ORDER BY sd.staff_id DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get staff member by ID
 */
export const getStaffById = async (
  staffId: number,
): Promise<StaffWithAccount | null> => {
  const query = `
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
      sa.department_id,
      d.department_name
    FROM staff_details sd
    LEFT JOIN staff_accounts sa ON sd.staff_id = sa.staff_id
    LEFT JOIN departments d ON sa.department_id = d.department_id
    WHERE sd.staff_id = $1
  `;

  const result = await pool.query(query, [staffId]);
  return result.rows.length > 0 ? result.rows[0] : null;
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

  // Validate work type
  const validWorkTypes = ["Employment", "Consultancy", "Internship"];
  if (!validWorkTypes.includes(work_type)) {
    throw new ApiError(
      400,
      `Invalid work type. Must be one of: ${validWorkTypes.join(", ")}`,
    );
  }

  // Check if email already exists
  const emailCheck = await pool.query(
    "SELECT staff_id FROM staff_details WHERE personal_email = $1",
    [personal_email],
  );

  if (emailCheck.rows.length > 0) {
    throw new ApiError(400, "Email already exists");
  }

  const query = `
    INSERT INTO staff_details (
      staff_name, work_type, staff_role, gender, 
      personal_email, phone_number, date_joined
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    staff_name,
    work_type,
    staff_role,
    gender || null,
    personal_email,
    phone_number || null,
    date_joined,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update staff member
 */
export const updateStaff = async (
  staffId: number,
  staffData: Partial<StaffDetails>,
): Promise<StaffDetails | null> => {
  // Check if staff exists
  const existingStaff = await getStaffById(staffId);
  if (!existingStaff) {
    return null;
  }

  // Build dynamic update query
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

  const query = `
    UPDATE staff_details 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE staff_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete staff member
 */
export const deleteStaff = async (staffId: number): Promise<boolean> => {
  const result = await pool.query(
    "DELETE FROM staff_details WHERE staff_id = $1 RETURNING staff_id",
    [staffId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get staff by work type
 */
export const getStaffByWorkType = async (
  workType: string,
): Promise<StaffWithAccount[]> => {
  const query = `
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
      sa.status
    FROM staff_details sd
    LEFT JOIN staff_accounts sa ON sd.staff_id = sa.staff_id
    WHERE sd.work_type = $1
    ORDER BY sd.staff_id DESC
  `;

  const result = await pool.query(query, [workType]);
  return result.rows;
};
