import { Request, Response } from "express";
import * as departmentService from "../services/department.service";
import { ApiError } from "../middleware";

/**
 * Department Controllers
 * Handle HTTP requests and responses for department-related operations
 */

/**
 * Get all departments
 * @route GET /api/departments
 */
export const getAllDepartments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const departments = await departmentService.getAllDepartments();

  res.status(200).json({
    status: "success",
    data: departments,
    count: departments.length,
  });
};

/**
 * Get department by ID
 * @route GET /api/departments/:id
 */
export const getDepartmentById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const department = await departmentService.getDepartmentById(parseInt(id));

  if (!department) {
    throw new ApiError(404, `Department with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    data: department,
  });
};

/**
 * Create new department
 * @route POST /api/departments
 */
export const createDepartment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const departmentData = req.body;
  const newDepartment =
    await departmentService.createDepartment(departmentData);

  res.status(201).json({
    status: "success",
    message: "Department created successfully",
    data: newDepartment,
  });
};

/**
 * Update department
 * @route PUT /api/departments/:id
 */
export const updateDepartment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const departmentData = req.body;

  const updatedDepartment = await departmentService.updateDepartment(
    parseInt(id),
    departmentData,
  );

  if (!updatedDepartment) {
    throw new ApiError(404, `Department with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Department updated successfully",
    data: updatedDepartment,
  });
};

/**
 * Delete department
 * @route DELETE /api/departments/:id
 */
export const deleteDepartment = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deleted = await departmentService.deleteDepartment(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Department with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Department deleted successfully",
  });
};

/**
 * Get all staff in a department
 * @route GET /api/departments/:id/staff
 */
export const getDepartmentStaff = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  // First check if department exists
  const department = await departmentService.getDepartmentById(parseInt(id));
  if (!department) {
    throw new ApiError(404, `Department with ID ${id} not found`);
  }

  const staff = await departmentService.getDepartmentStaff(parseInt(id));

  res.status(200).json({
    status: "success",
    data: staff,
    count: staff.length,
  });
};
