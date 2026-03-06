/**
 * Timesheet service — SQL query strings and query-builder helpers
 *
 * Centralises all raw SQL so the service layer stays free of query noise.
 * Nothing in this file imports from the service — it is a pure query module.
 */

import {
  TimesheetQueryOptions,
  TimesheetSortField,
} from "../types/timesheets.types";

// ─── Constants ────────────────────────────────────────────────────────────────

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 20;
export const MAX_LIMIT = 100;

/**
 * Whitelist of sortable columns.
 * Using a record instead of string interpolation prevents SQL injection
 * on the ORDER BY clause.
 */
export const ALLOWED_SORT_FIELDS: Record<TimesheetSortField, string> = {
  date: "t.date",
  check_in_time: "t.check_in_time",
  check_out_time: "t.check_out_time",
  hours_spent: "t.hours_spent",
  staff_name: "sd.staff_name",
  department_name: "d.department_name",
  task_type: "t.task_type",
  task_station: "t.task_station",
};

// ─── Shared FROM / JOIN fragment ──────────────────────────────────────────────

/**
 * Reused by both the SELECT query and the COUNT query so joins stay in sync.
 */
export const TIMESHEET_FROM = `
  FROM timesheets t
  INNER JOIN staff_details sd ON t.staff_id   = sd.staff_id
  INNER JOIN departments   d  ON t.department_id = d.department_id
  LEFT  JOIN clients       c  ON t.client_id  = c.client_id
  LEFT  JOIN projects      p  ON t.project_id = p.project_id
`;

/** Full column list for list / single-row queries */
export const TIMESHEET_SELECT = `
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
  ${TIMESHEET_FROM}
`;

// ─── WHERE clause builder ─────────────────────────────────────────────────────

export interface WhereClauseResult {
  whereClause: string;
  values: any[];
  paramCount: number;
}

/**
 * Builds a parameterised WHERE clause from TimesheetQueryOptions.
 *
 * Returns the clause string, the bound values array, and the next
 * available param index so callers can safely append LIMIT / OFFSET.
 */
export const buildWhereClause = (
  options: TimesheetQueryOptions,
): WhereClauseResult => {
  const conditions: string[] = ["1=1"];
  const values: any[] = [];
  let paramCount = 1;

  // ── Date range ──────────────────────────────────────────────────────────────
  if (options.startDate) {
    conditions.push(`t.date >= $${paramCount++}`);
    values.push(options.startDate);
  }
  if (options.endDate) {
    conditions.push(`t.date <= $${paramCount++}`);
    values.push(options.endDate);
  }

  // ── ID filters ──────────────────────────────────────────────────────────────
  if (options.staffId) {
    conditions.push(`t.staff_id = $${paramCount++}`);
    values.push(options.staffId);
  }
  if (options.departmentId) {
    conditions.push(`t.department_id = $${paramCount++}`);
    values.push(options.departmentId);
  }
  if (options.clientId) {
    conditions.push(`t.client_id = $${paramCount++}`);
    values.push(options.clientId);
  }
  if (options.projectId) {
    conditions.push(`t.project_id = $${paramCount++}`);
    values.push(options.projectId);
  }

  // ── Enum filters ────────────────────────────────────────────────────────────
  if (options.taskStation) {
    conditions.push(`t.task_station = $${paramCount++}`);
    values.push(options.taskStation);
  }
  if (options.taskType) {
    conditions.push(`t.task_type = $${paramCount++}`);
    values.push(options.taskType);
  }

  // ── Hours range ─────────────────────────────────────────────────────────────
  if (options.minHours !== undefined) {
    conditions.push(`t.hours_spent >= $${paramCount++}`);
    values.push(options.minHours);
  }
  if (options.maxHours !== undefined) {
    conditions.push(`t.hours_spent <= $${paramCount++}`);
    values.push(options.maxHours);
  }

  // ── Full-text search (staff name, task description, task type) ───────────────
  if (options.search) {
    conditions.push(`(
      sd.staff_name      ILIKE $${paramCount} OR
      t.task_description ILIKE $${paramCount} OR
      t.task_type        ILIKE $${paramCount}
    )`);
    values.push(`%${options.search}%`);
    paramCount++;
  }

  return {
    whereClause: `WHERE ${conditions.join(" AND ")}`,
    values,
    paramCount,
  };
};

// ─── Static query strings ─────────────────────────────────────────────────────

export const QUERIES = {
  getById: `
    ${TIMESHEET_SELECT}
    WHERE t.timesheet_id = $1
  `,

  insert: `
    INSERT INTO timesheets (
      staff_id, task_description, task_type, task_station,
      department_id, date, check_in_time, check_out_time,
      client_id, project_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `,

  deleteById: `
    DELETE FROM timesheets
    WHERE timesheet_id = $1
    RETURNING timesheet_id
  `,

  staffHoursSummary: `
    SELECT
      sd.staff_name,
      SUM(t.hours_spent)    AS total_hours,
      COUNT(t.timesheet_id) AS number_of_entries,
      MIN(t.date)           AS first_entry_date,
      MAX(t.date)           AS last_entry_date
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    WHERE t.staff_id = $1
  `,

  projectHoursSummary: `
    SELECT
      p.project_name,
      c.client_name,
      SUM(t.hours_spent)         AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      COUNT(t.timesheet_id)      AS number_of_entries,
      MIN(t.date)                AS first_entry_date,
      MAX(t.date)                AS last_entry_date
    FROM timesheets t
    INNER JOIN projects p ON t.project_id = p.project_id
    INNER JOIN clients  c ON p.client_id  = c.client_id
    WHERE t.project_id = $1
    GROUP BY p.project_name, c.client_name
  `,
} as const;
