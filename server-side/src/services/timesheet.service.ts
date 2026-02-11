import { pool } from "../config/database";
import { ApiError } from "../middleware";

/**
 * Timesheet Service
 * Contains business logic for timesheet operations
 */

export interface TimesheetEntry {
  timesheet_id?: number;
  staff_id: number;
  task_description: string;
  task_type: string;
  task_station: "Office" | "Field" | "Remote";
  department_id: number;
  date: string;
  check_in_time: string;
  check_out_time: string;
  hours_spent?: number;
  client_id?: number;
  project_id?: number;
}

export interface TimesheetWithDetails extends TimesheetEntry {
  staff_name?: string;
  department_name?: string;
  client_name?: string;
  project_name?: string;
}

export interface TimesheetFilters {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  departmentId?: number;
}

/**
 * Get timesheets with optional filters
 */
export const getTimesheets = async (
  filters: TimesheetFilters,
): Promise<TimesheetWithDetails[]> => {
  let query = `
    SELECT 
      t.timesheet_id,
      t.staff_id,
      sd.staff_name,
      t.task_description,
      t.task_type,
      t.task_station,
      t.department_id,
      d.department_name,
      t.date,
      t.check_in_time,
      t.check_out_time,
      t.hours_spent,
      t.client_id,
      c.client_name,
      t.project_id,
      p.project_name
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    INNER JOIN departments d ON t.department_id = d.department_id
    LEFT JOIN clients c ON t.client_id = c.client_id
    LEFT JOIN projects p ON t.project_id = p.project_id
    WHERE 1=1
  `;

  const values: any[] = [];
  let paramCount = 1;

  if (filters.startDate) {
    query += ` AND t.date >= $${paramCount}`;
    values.push(filters.startDate);
    paramCount++;
  }

  if (filters.endDate) {
    query += ` AND t.date <= $${paramCount}`;
    values.push(filters.endDate);
    paramCount++;
  }

  if (filters.staffId) {
    query += ` AND t.staff_id = $${paramCount}`;
    values.push(filters.staffId);
    paramCount++;
  }

  if (filters.departmentId) {
    query += ` AND t.department_id = $${paramCount}`;
    values.push(filters.departmentId);
    paramCount++;
  }

  query += " ORDER BY t.date DESC, t.check_in_time DESC";

  const result = await pool.query(query, values);
  return result.rows;
};

/**
 * Get timesheet by ID
 */
export const getTimesheetById = async (
  timesheetId: number,
): Promise<TimesheetWithDetails | null> => {
  const query = `
    SELECT 
      t.timesheet_id,
      t.staff_id,
      sd.staff_name,
      t.task_description,
      t.task_type,
      t.task_station,
      t.department_id,
      d.department_name,
      t.date,
      t.check_in_time,
      t.check_out_time,
      t.hours_spent,
      t.client_id,
      c.client_name,
      t.project_id,
      p.project_name
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    INNER JOIN departments d ON t.department_id = d.department_id
    LEFT JOIN clients c ON t.client_id = c.client_id
    LEFT JOIN projects p ON t.project_id = p.project_id
    WHERE t.timesheet_id = $1
  `;

  const result = await pool.query(query, [timesheetId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new timesheet entry
 */
export const createTimesheet = async (
  timesheetData: TimesheetEntry,
): Promise<TimesheetEntry> => {
  const {
    staff_id,
    task_description,
    task_type,
    task_station,
    department_id,
    date,
    check_in_time,
    check_out_time,
    client_id,
    project_id,
  } = timesheetData;

  // Validate task station
  const validStations = ["Office", "Field", "Remote"];
  if (!validStations.includes(task_station)) {
    throw new ApiError(
      400,
      `Invalid task station. Must be one of: ${validStations.join(", ")}`,
    );
  }

  // Validate that check_out_time is after check_in_time
  if (check_out_time <= check_in_time) {
    throw new ApiError(400, "Check-out time must be after check-in time");
  }

  const query = `
    INSERT INTO timesheets (
      staff_id, task_description, task_type, task_station,
      department_id, date, check_in_time, check_out_time,
      client_id, project_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    staff_id,
    task_description,
    task_type,
    task_station,
    department_id,
    date,
    check_in_time,
    check_out_time,
    client_id || null,
    project_id || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update timesheet entry
 */
export const updateTimesheet = async (
  timesheetId: number,
  timesheetData: Partial<TimesheetEntry>,
): Promise<TimesheetEntry | null> => {
  // Check if timesheet exists
  const existingTimesheet = await getTimesheetById(timesheetId);
  if (!existingTimesheet) {
    return null;
  }

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(timesheetData).forEach(([key, value]) => {
    if (
      value !== undefined &&
      key !== "timesheet_id" &&
      key !== "hours_spent"
    ) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(timesheetId);

  const query = `
    UPDATE timesheets 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE timesheet_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete timesheet entry
 */
export const deleteTimesheet = async (
  timesheetId: number,
): Promise<boolean> => {
  const result = await pool.query(
    "DELETE FROM timesheets WHERE timesheet_id = $1 RETURNING timesheet_id",
    [timesheetId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get staff hours summary for a date range
 */
export const getStaffHoursSummary = async (
  staffId: number,
  startDate?: string,
  endDate?: string,
): Promise<any> => {
  let query = `
    SELECT 
      sd.staff_name,
      SUM(t.hours_spent) AS total_hours,
      COUNT(t.timesheet_id) AS number_of_entries,
      MIN(t.date) AS first_entry_date,
      MAX(t.date) AS last_entry_date
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    WHERE t.staff_id = $1
  `;

  const values: any[] = [staffId];
  let paramCount = 2;

  if (startDate) {
    query += ` AND t.date >= $${paramCount}`;
    values.push(startDate);
    paramCount++;
  }

  if (endDate) {
    query += ` AND t.date <= $${paramCount}`;
    values.push(endDate);
    paramCount++;
  }

  query += " GROUP BY sd.staff_name";

  const result = await pool.query(query, values);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Get project hours summary
 */
export const getProjectHoursSummary = async (
  projectId: number,
): Promise<any> => {
  const query = `
    SELECT 
      p.project_name,
      c.client_name,
      SUM(t.hours_spent) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      COUNT(t.timesheet_id) AS number_of_entries,
      MIN(t.date) AS first_entry_date,
      MAX(t.date) AS last_entry_date
    FROM timesheets t
    INNER JOIN projects p ON t.project_id = p.project_id
    INNER JOIN clients c ON p.client_id = c.client_id
    WHERE t.project_id = $1
    GROUP BY p.project_name, c.client_name
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};
