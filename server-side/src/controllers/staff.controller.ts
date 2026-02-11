import { Request, Response } from "express";
import * as staffService from "../services/staff.service";
import { ApiError } from "../middleware/index";

/**
 * Staff Controllers
 * Handle HTTP requests and responses for staff-related operations
 */

/**
 * Get all staff members
 * @route GET /api/staff
 */
export const getAllStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staff = await staffService.getAllStaff();

  res.status(200).json({
    status: "success",
    data: staff,
    count: staff.length,
  });
};

/**
 * Get staff by ID
 * @route GET /api/staff/:id
 */
export const getStaffById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const staff = await staffService.getStaffById(parseInt(id));

  if (!staff) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    data: staff,
  });
};

/**
 * Create new staff member
 * @route POST /api/staff
 */
export const createStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const staffData = req.body;
  const newStaff = await staffService.createStaff(staffData);

  res.status(201).json({
    status: "success",
    message: "Staff member created successfully",
    data: newStaff,
  });
};

/**
 * Update staff member
 * @route PUT /api/staff/:id
 */
export const updateStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const staffData = req.body;

  const updatedStaff = await staffService.updateStaff(parseInt(id), staffData);

  if (!updatedStaff) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Staff member updated successfully",
    data: updatedStaff,
  });
};

/**
 * Delete staff member
 * @route DELETE /api/staff/:id
 */
export const deleteStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deleted = await staffService.deleteStaff(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Staff member with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Staff member deleted successfully",
  });
};

/**
 * Get staff by work type
 * @route GET /api/staff/work-type/:type
 */
export const getStaffByWorkType = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { type } = req.params;
  const staff = await staffService.getStaffByWorkType(type);

  res.status(200).json({
    status: "success",
    data: staff,
    count: staff.length,
  });
};
