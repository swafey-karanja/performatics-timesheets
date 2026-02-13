import { Request, Response } from "express";
import * as projectService from "../services/projects.service";
import { ApiError } from "../middleware";

/**
 * Project Controllers
 * Handle HTTP requests and responses for project-related operations
 */

/**
 * Get all projects
 * @route GET /api/projects
 */
export const getAllProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projects = await projectService.getAllProjects();

  res.status(200).json({
    projects, // ✅ This is fine - just don't wrap it again
    count: projects.length,
  });
};

/**
 * Get project by ID
 * @route GET /api/projects/:id
 */
export const getProjectById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const project = await projectService.getProjectById(parseInt(id));

  if (!project) {
    throw new ApiError(404, `Project with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    data: project,
  });
};

/**
 * Create new project
 * @route POST /api/projects
 */
export const createProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projectData = req.body;
  const newProject = await projectService.createProject(projectData);

  res.status(201).json({
    status: "success",
    message: "Project created successfully",
    data: newProject,
  });
};

/**
 * Update project
 * @route PUT /api/projects/:id
 */
export const updateProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const projectData = req.body;

  const updatedProject = await projectService.updateProject(
    parseInt(id),
    projectData,
  );

  if (!updatedProject) {
    throw new ApiError(404, `Project with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Project updated successfully",
    data: updatedProject,
  });
};

/**
 * Delete project
 * @route DELETE /api/projects/:id
 */
export const deleteProject = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deleted = await projectService.deleteProject(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Project with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Project deleted successfully",
  });
};

/**
 * Get projects by cluster
 * @route GET /api/projects/cluster/:cluster
 */
export const getProjectsByCluster = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { cluster } = req.params;
  const projects = await projectService.getProjectsByCluster(cluster);

  res.status(200).json({
    status: "success",
    data: projects,
    count: projects.length,
  });
};

/**
 * Get active projects
 * @route GET /api/projects/active
 */
export const getActiveProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const projects = await projectService.getActiveProjects();

  res.status(200).json({
    status: "success",
    data: projects,
    count: projects.length,
  });
};

/**
 * Get projects by account manager
 * @route GET /api/projects/account-manager/:accountManagerId
 */
export const getProjectsByAccountManager = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { accountManagerId } = req.params;
  const projects = await projectService.getProjectsByAccountManager(
    parseInt(accountManagerId),
  );

  res.status(200).json({
    status: "success",
    data: projects,
    count: projects.length,
  });
};

/**
 * Get project timesheets
 * @route GET /api/projects/:id/timesheets
 */
export const getProjectTimesheets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  // First check if project exists
  const project = await projectService.getProjectById(parseInt(id));
  if (!project) {
    throw new ApiError(404, `Project with ID ${id} not found`);
  }

  const timesheets = await projectService.getProjectTimesheets(parseInt(id));

  res.status(200).json({
    status: "success",
    data: timesheets,
    count: timesheets.length,
  });
};

/**
 * Get project staff breakdown
 * @route GET /api/projects/:id/staff
 */
export const getProjectStaffBreakdown = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  // First check if project exists
  const project = await projectService.getProjectById(parseInt(id));
  if (!project) {
    throw new ApiError(404, `Project with ID ${id} not found`);
  }

  const staffBreakdown = await projectService.getProjectStaffBreakdown(
    parseInt(id),
  );

  res.status(200).json({
    status: "success",
    data: staffBreakdown,
    count: staffBreakdown.length,
  });
};
