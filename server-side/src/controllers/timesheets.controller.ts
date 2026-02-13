import { Request, Response } from "express";
import * as timesheetService from "../services/timesheet.service";
import { ApiError } from "../middleware/index";

/**
 * Timesheet Controllers
 * Handle HTTP requests and responses for timesheet-related operations
 */

/**
 * Get all timesheets
 * @route GET /api/timesheets
 */
export const getAllTimesheets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { startDate, endDate, staffId, departmentId } = req.query;

  const filters = {
    startDate: startDate as string,
    endDate: endDate as string,
    staffId: staffId ? parseInt(staffId as string) : undefined,
    departmentId: departmentId ? parseInt(departmentId as string) : undefined,
  };

  const timesheets = await timesheetService.getTimesheets(filters);

  res.status(200).json({
    status: "success",
    data: timesheets,
    count: timesheets.length,
  });
};

/**
 * Get timesheet by ID
 * @route GET /api/timesheets/:id
 */
export const getTimesheetById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const timesheet = await timesheetService.getTimesheetById(parseInt(id));

  if (!timesheet) {
    throw new ApiError(404, `Timesheet with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    data: timesheet,
  });
};

/**
 * Create new timesheet entry
 * @route POST /api/timesheets
 */
export const createTimesheet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const timesheetData = req.body;
  const newTimesheet = await timesheetService.createTimesheet(timesheetData);

  res.status(201).json({
    message: "Timesheet entry created successfully",
    newTimesheet,
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
  const { id } = req.params;
  const timesheetData = req.body;

  const updatedTimesheet = await timesheetService.updateTimesheet(
    parseInt(id),
    timesheetData,
  );

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
  const { id } = req.params;
  const deleted = await timesheetService.deleteTimesheet(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Timesheet with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Timesheet entry deleted successfully",
  });
};

/**
 * Get staff hours summary
 * @route GET /api/timesheets/staff/:staffId/hours
 */
export const getStaffHours = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { staffId } = req.params;
  const { startDate, endDate } = req.query;

  const hours = await timesheetService.getStaffHoursSummary(
    parseInt(staffId),
    startDate as string,
    endDate as string,
  );

  res.status(200).json({
    status: "success",
    data: hours,
  });
};

/**
 * Get project hours summary
 * @route GET /api/timesheets/projects/:projectId/hours
 */
export const getProjectHours = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { projectId } = req.params;

  const hours = await timesheetService.getProjectHoursSummary(
    parseInt(projectId),
  );

  res.status(200).json({
    status: "success",
    data: hours,
  });
};
