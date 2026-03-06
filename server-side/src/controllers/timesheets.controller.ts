/**
 * Timesheet Controllers
 * Handle HTTP requests and responses for timesheet-related operations.
 *
 * Query parsing is delegated to parseTimesheetQueryOptions (timesheet.helpers.ts)
 * so this file contains only request/response handling.
 */

import { Request, Response } from "express";
import { ApiError } from "../middleware/index";
import * as timesheetService from "../services/timesheet.service";
import { parseTimesheetQueryOptions } from "../utils/timesheet.helpers";

// ─── List endpoints ───────────────────────────────────────────────────────────

/**
 * Get all timesheets
 * Supports: pagination, filtering, sorting, search
 *
 * @route GET /api/timesheets
 * @query page          - Page number (default: 1)
 * @query limit         - Records per page (default: 20, max: 100)
 * @query sortBy        - date | check_in_time | check_out_time | hours_spent | staff_name | department_name | task_type | task_station
 * @query sortOrder     - ASC | DESC (default: DESC)
 * @query search        - Full-text search across staff_name, task_description, task_type
 * @query startDate     - ISO8601 date range start
 * @query endDate       - ISO8601 date range end
 * @query staffId       - Filter by staff
 * @query departmentId  - Filter by department
 * @query clientId      - Filter by client
 * @query projectId     - Filter by project
 * @query taskStation   - Office | Field | Remote
 * @query taskType      - Exact task type match
 * @query minHours      - Minimum hours spent
 * @query maxHours      - Maximum hours spent
 */
export const getAllTimesheets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const options = parseTimesheetQueryOptions(req.query);
  const result = await timesheetService.getTimesheets(options);

  res.status(200).json({ status: "success", ...result });
};

/**
 * Get timesheets for a specific staff member.
 * Supports the same query options as getAllTimesheets.
 *
 * @route GET /api/timesheets/staff/:staffId
 */
export const getTimesheetsByStaffId = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staffId = parseInt(req.params.staffId as string, 10);
  const options = parseTimesheetQueryOptions(req.query);
  const result = await timesheetService.getTimesheetsByStaffId(
    staffId,
    options,
  );

  if (result.pagination.total === 0) {
    throw new ApiError(
      404,
      `No timesheet records found for staff ID ${staffId}`,
    );
  }

  res.status(200).json({ status: "success", ...result });
};

// ─── Single-record endpoints ──────────────────────────────────────────────────

/**
 * Get timesheet by ID
 * @route GET /api/timesheets/:id
 */
export const getTimesheetById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const timesheet = await timesheetService.getTimesheetById(id);

  if (!timesheet) {
    throw new ApiError(404, `Timesheet with ID ${id} not found`);
  }

  res.status(200).json({ status: "success", data: timesheet });
};

// ─── Mutation endpoints ───────────────────────────────────────────────────────

/**
 * Create new timesheet entry
 * @route POST /api/timesheets
 */
export const createTimesheet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const newTimesheet = await timesheetService.createTimesheet(req.body);

  res.status(201).json({
    status: "success",
    message: "Timesheet entry created successfully",
    data: newTimesheet,
  });
};

/**
 * Update timesheet entry
 * @route PUT /api/timesheets/:id
 */
export const updateTimesheet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const updatedTimesheet = await timesheetService.updateTimesheet(id, req.body);

  if (!updatedTimesheet) {
    throw new ApiError(404, `Timesheet with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Timesheet entry updated successfully",
    data: updatedTimesheet,
  });
};

/**
 * Delete timesheet entry
 * @route DELETE /api/timesheets/:id
 */
export const deleteTimesheet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const id = parseInt(req.params.id as string, 10);
  const deleted = await timesheetService.deleteTimesheet(id);

  if (!deleted) {
    throw new ApiError(404, `Timesheet with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Timesheet entry deleted successfully",
  });
};

// ─── Summary endpoints ────────────────────────────────────────────────────────

/**
 * Get staff hours summary
 * @route GET /api/timesheets/staff/:staffId/hours
 */
export const getStaffHours = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staffId = parseInt(req.params.staffId as string, 10);
  const { startDate, endDate } = req.query;

  const hours = await timesheetService.getStaffHoursSummary(
    staffId,
    startDate as string,
    endDate as string,
  );

  res.status(200).json({ status: "success", data: hours });
};

/**
 * Get project hours summary
 * @route GET /api/timesheets/projects/:projectId/hours
 */
export const getProjectHours = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectId = parseInt(req.params.projectId as string, 10);
  const hours = await timesheetService.getProjectHoursSummary(projectId);

  res.status(200).json({ status: "success", data: hours });
};
