/**
 * Timesheet Service
 *
 * Business logic only — no raw SQL, no type definitions, no query parsing.
 * Those concerns live in:
 *   timesheet.types.ts   — interfaces & types
 *   timesheet.queries.ts — SQL strings & WHERE clause builder
 *   timesheet.helpers.ts — validation, normalisation, query parsing
 */

import { pool } from "../config/database";
import { ApiError } from "../middleware";

import {
  TimesheetEntry,
  TimesheetWithDetails,
  TimesheetQueryOptions,
  PaginatedTimesheetResult,
  StaffHoursSummary,
  ProjectHoursSummary,
} from "../types/timesheets.types";

import {
  TIMESHEET_SELECT,
  TIMESHEET_FROM,
  QUERIES,
  buildWhereClause,
} from "../queries/timesheet.queries";

import {
  validateTimesheetEntry,
  resolveSortColumn,
  normalisePagination,
  buildUpdateClause,
} from "../utils/timesheet.helpers";

// ─── Read ─────────────────────────────────────────────────────────────────────

/**
 * Returns a paginated, filtered, sorted, and searchable list of timesheets.
 * @route GET /api/timesheets
 */
export const getTimesheets = async (
  options: TimesheetQueryOptions = {},
): Promise<PaginatedTimesheetResult> => {
  const { page, limit, offset } = normalisePagination(options);
  const sortColumn = resolveSortColumn(options.sortBy);
  const sortOrder = options.sortOrder === "ASC" ? "ASC" : "DESC";

  const { whereClause, values, paramCount } = buildWhereClause(options);

  const countQuery = `SELECT COUNT(*) AS total ${TIMESHEET_FROM} ${whereClause}`;
  const dataQuery = `
    ${TIMESHEET_SELECT}
    ${whereClause}
    ORDER BY ${sortColumn} ${sortOrder}
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

  const [countResult, dataResult] = await Promise.all([
    pool.query(countQuery, values),
    pool.query(dataQuery, [...values, limit, offset]),
  ]);

  const total = parseInt(countResult.rows[0].total, 10);
  const totalPages = Math.ceil(total / limit);

  return {
    data: dataResult.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  };
};

/**
 * Returns paginated timesheets scoped to a single staff member.
 * Accepts the same query options as getTimesheets.
 * @route GET /api/timesheets/staff/:staffId
 */
export const getTimesheetsByStaffId = async (
  staffId: number,
  options: Omit<TimesheetQueryOptions, "staffId"> = {},
): Promise<PaginatedTimesheetResult> => {
  return getTimesheets({ ...options, staffId });
};

/**
 * Returns a single timesheet by its primary key, or null if not found.
 * @route GET /api/timesheets/:id
 */
export const getTimesheetById = async (
  timesheetId: number,
): Promise<TimesheetWithDetails | null> => {
  const result = await pool.query(QUERIES.getById, [timesheetId]);
  return result.rows[0] ?? null;
};

// ─── Write ────────────────────────────────────────────────────────────────────

/**
 * Inserts a new timesheet record after validating station and check times.
 * @route POST /api/timesheets
 */
export const createTimesheet = async (
  data: TimesheetEntry,
): Promise<TimesheetEntry> => {
  validateTimesheetEntry(data);

  const values = [
    data.staff_id,
    data.task_description,
    data.task_type,
    data.task_station,
    data.department_id,
    data.date,
    data.check_in_time,
    data.check_out_time,
    data.client_id ?? null,
    data.project_id ?? null,
  ];

  const result = await pool.query(QUERIES.insert, values);
  return result.rows[0];
};

/**
 * Applies a partial update to an existing timesheet.
 * Returns null if the record does not exist.
 * @route PUT /api/timesheets/:id
 */
export const updateTimesheet = async (
  timesheetId: number,
  data: Partial<TimesheetEntry>,
): Promise<TimesheetEntry | null> => {
  const existing = await getTimesheetById(timesheetId);
  if (!existing) return null;

  const { setClause, values, nextParam } = buildUpdateClause(data);
  values.push(timesheetId);

  const query = `
    UPDATE timesheets
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE timesheet_id = $${nextParam}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Deletes a timesheet by ID.
 * Returns true if a row was deleted, false if not found.
 * @route DELETE /api/timesheets/:id
 */
export const deleteTimesheet = async (
  timesheetId: number,
): Promise<boolean> => {
  const result = await pool.query(QUERIES.deleteById, [timesheetId]);
  return (result.rowCount ?? 0) > 0;
};

// ─── Summaries ────────────────────────────────────────────────────────────────

/**
 * Aggregates total hours logged by a staff member over an optional date range.
 * @route GET /api/timesheets/staff/:staffId/hours
 */
export const getStaffHoursSummary = async (
  staffId: number,
  startDate?: string,
  endDate?: string,
): Promise<StaffHoursSummary | null> => {
  let query = QUERIES.staffHoursSummary;
  const values: any[] = [staffId];
  let paramCount = 2;

  if (startDate) {
    query += ` AND t.date >= $${paramCount++}`;
    values.push(startDate);
  }
  if (endDate) {
    query += ` AND t.date <= $${paramCount++}`;
    values.push(endDate);
  }

  query += " GROUP BY sd.staff_name";

  const result = await pool.query(query, values);
  return result.rows[0] ?? null;
};

/**
 * Aggregates total hours, staff count, and entry count for a project.
 * @route GET /api/timesheets/projects/:projectId/hours
 */
export const getProjectHoursSummary = async (
  projectId: number,
): Promise<ProjectHoursSummary | null> => {
  const result = await pool.query(QUERIES.projectHoursSummary, [projectId]);
  return result.rows[0] ?? null;
};
