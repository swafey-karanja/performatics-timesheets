/**
 * Timesheet service — helper & validation functions
 *
 * Pure functions with no database or Express dependencies.
 * Importable by the service, controllers, or tests without side-effects.
 */

import { ApiError } from "../middleware";
import { TaskStation, TaskType } from "../types/types";
import {
  TimesheetQueryOptions,
  TimesheetSortField,
  TimesheetEntry,
} from "../types/timesheets.types";
import {
  ALLOWED_SORT_FIELDS,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "../queries/timesheet.queries";

// ─── Validation helpers ───────────────────────────────────────────────────────

/**
 * Validates task station value.
 * Throws ApiError 400 if the value is not one of the allowed stations.
 */
export const validateTaskStation = (station: string): void => {
  const valid: TaskStation[] = ["Office", "Field", "Remote"];
  if (!valid.includes(station as TaskStation)) {
    throw new ApiError(
      400,
      `Invalid task station. Must be one of: ${valid.join(", ")}`,
    );
  }
};

/**
 * Validates that check-out time is strictly after check-in time.
 * Throws ApiError 400 if the constraint is violated.
 */
export const validateCheckTimes = (checkIn: string, checkOut: string): void => {
  if (checkOut <= checkIn) {
    throw new ApiError(400, "Check-out time must be after check-in time");
  }
};

/**
 * Validates a full TimesheetEntry before insert.
 * Composes the individual validators above.
 */
export const validateTimesheetEntry = (data: TimesheetEntry): void => {
  validateTaskStation(data.task_station);
  validateCheckTimes(data.check_in_time, data.check_out_time);
};

// ─── Query normalisation helpers ──────────────────────────────────────────────

/**
 * Resolves a caller-supplied sort field to a safe SQL column expression.
 * Falls back to `t.date` for unknown or missing values.
 */
export const resolveSortColumn = (sortBy?: TimesheetSortField): string =>
  (sortBy && ALLOWED_SORT_FIELDS[sortBy]) ?? "t.date";

/**
 * Clamps and normalises pagination inputs.
 * Ensures page >= 1 and 1 <= limit <= MAX_LIMIT.
 */
export const normalisePagination = (
  options: Pick<TimesheetQueryOptions, "page" | "limit">,
): { page: number; limit: number; offset: number } => {
  const page = Math.max(1, options.page ?? DEFAULT_PAGE);
  const limit = Math.min(
    Math.max(1, options.limit ?? DEFAULT_LIMIT),
    MAX_LIMIT,
  );
  return { page, limit, offset: (page - 1) * limit };
};

/**
 * Builds the dynamic SET clause for an UPDATE statement.
 * Skips read-only fields (timesheet_id, hours_spent) and undefined values.
 *
 * Returns the clause string, bound values, and next param index.
 * Throws ApiError 400 if no updatable fields are found.
 */
export const buildUpdateClause = (
  data: Partial<TimesheetEntry>,
): { setClause: string; values: any[]; nextParam: number } => {
  const READONLY_FIELDS = new Set(["timesheet_id", "hours_spent"]);

  const fields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined && !READONLY_FIELDS.has(key)) {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  }

  if (fields.length === 0) {
    throw new ApiError(400, "No valid fields provided for update");
  }

  return {
    setClause: fields.join(", "),
    values,
    nextParam: paramCount,
  };
};

/**
 * Parses raw Express query params into a typed TimesheetQueryOptions object.
 * Used by controllers to keep req.query casting in one place.
 */
export const parseTimesheetQueryOptions = (
  reqQuery: Record<string, any>,
): TimesheetQueryOptions => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    startDate,
    endDate,
    staffId,
    departmentId,
    clientId,
    projectId,
    taskStation,
    taskType,
    minHours,
    maxHours,
  } = reqQuery;

  return {
    page: page ? parseInt(page, 10) : undefined,
    limit: limit ? parseInt(limit, 10) : undefined,
    sortBy: sortBy as TimesheetSortField | undefined,
    sortOrder:
      sortOrder === "ASC" ? "ASC" : sortOrder === "DESC" ? "DESC" : undefined,
    search: search as string | undefined,
    startDate: startDate as string | undefined,
    endDate: endDate as string | undefined,
    staffId: staffId ? parseInt(staffId, 10) : undefined,
    departmentId: departmentId ? parseInt(departmentId, 10) : undefined,
    clientId: clientId ? parseInt(clientId, 10) : undefined,
    projectId: projectId ? parseInt(projectId, 10) : undefined,
    taskStation: taskStation as TaskStation | undefined,
    taskType: taskType as TaskType | undefined,
    minHours: minHours ? parseFloat(minHours) : undefined,
    maxHours: maxHours ? parseFloat(maxHours) : undefined,
  };
};
