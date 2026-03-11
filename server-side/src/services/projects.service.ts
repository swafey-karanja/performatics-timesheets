import { pool } from "../config/database";
import { ApiError } from "../middleware";
import { PROJECT_QUERIES } from "../queries/project.queries";

/**
 * Project Service
 * Contains business logic for project operations
 */

export interface Project {
  project_id?: number;
  project_name: string;
  client_id: number;
  start_date: string;
  end_date?: string | null;
  cluster: "Stone" | "Ballast" | "Sand" | "Water";
  account_manager?: number | null;
  created_at?: Date;
  updated_at?: Date;
}

export interface ProjectWithDetails extends Project {
  client_name?: string;
  client_sector?: string;
  account_manager_name?: string;
  account_manager_email?: string;
  total_hours?: number;
  staff_count?: number;
  timesheet_count?: number;
  is_active?: boolean;
}

/**
 * Get all projects with client and summary details
 */
export const getAllProjects = async (): Promise<ProjectWithDetails[]> => {
  const result = await pool.query(PROJECT_QUERIES.getAllProjects);
  return result.rows;
};

/**
 * Get project by ID
 */
export const getProjectById = async (
  projectId: number,
): Promise<ProjectWithDetails | null> => {
  const result = await pool.query(PROJECT_QUERIES.getProjectById, [projectId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new project
 */
export const createProject = async (projectData: Project): Promise<Project> => {
  const {
    project_name,
    client_id,
    start_date,
    end_date,
    cluster,
    account_manager,
  } = projectData;

  // Validate cluster
  const validClusters = ["Stone", "Ballast", "Sand", "Water"];
  if (!validClusters.includes(cluster)) {
    throw new ApiError(
      400,
      `Invalid cluster. Must be one of: ${validClusters.join(", ")}`,
    );
  }

  // Verify client exists
  const clientCheck = await pool.query(PROJECT_QUERIES.checkClientExists, [
    client_id,
  ]);
  if (clientCheck.rows.length === 0) {
    throw new ApiError(400, "Client ID does not exist");
  }

  // Verify account manager exists if provided
  if (account_manager) {
    const managerCheck = await pool.query(
      PROJECT_QUERIES.checkAccountManagerExists,
      [account_manager],
    );
    if (managerCheck.rows.length === 0) {
      throw new ApiError(400, "Account manager ID does not exist");
    }
  }

  // Validate dates
  if (end_date && new Date(end_date) < new Date(start_date)) {
    throw new ApiError(400, "End date must be after start date");
  }

  const result = await pool.query(PROJECT_QUERIES.createProject, [
    project_name,
    client_id,
    start_date,
    end_date || null,
    cluster,
    account_manager || null,
  ]);

  return result.rows[0];
};

/**
 * Update project
 */
export const updateProject = async (
  projectId: number,
  projectData: Partial<Project>,
): Promise<Project | null> => {
  // Check if project exists
  const existingProject = await getProjectById(projectId);
  if (!existingProject) {
    return null;
  }

  // Validate cluster if provided
  if (projectData.cluster) {
    const validClusters = ["Stone", "Ballast", "Sand", "Water"];
    if (!validClusters.includes(projectData.cluster)) {
      throw new ApiError(
        400,
        `Invalid cluster. Must be one of: ${validClusters.join(", ")}`,
      );
    }
  }

  // Verify client if provided
  if (projectData.client_id) {
    const clientCheck = await pool.query(PROJECT_QUERIES.checkClientExists, [
      projectData.client_id,
    ]);
    if (clientCheck.rows.length === 0) {
      throw new ApiError(400, "Client ID does not exist");
    }
  }

  // Verify account manager if provided
  if (projectData.account_manager !== undefined) {
    if (projectData.account_manager !== null) {
      const managerCheck = await pool.query(
        PROJECT_QUERIES.checkAccountManagerExists,
        [projectData.account_manager],
      );
      if (managerCheck.rows.length === 0) {
        throw new ApiError(400, "Account manager ID does not exist");
      }
    }
  }

  // Validate dates if both are provided
  if (projectData.start_date && projectData.end_date) {
    if (new Date(projectData.end_date) < new Date(projectData.start_date)) {
      throw new ApiError(400, "End date must be after start date");
    }
  }

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(projectData).forEach(([key, value]) => {
    if (value !== undefined && key !== "project_id") {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(projectId);

  const updateQuery = `
    UPDATE projects
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE project_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};

/**
 * Delete project
 */
export const deleteProject = async (projectId: number): Promise<boolean> => {
  // Check if project has timesheets
  const timesheetCheck = await pool.query(
    PROJECT_QUERIES.checkProjectHasTimesheets,
    [projectId],
  );
  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete project with existing timesheet entries.",
    );
  }

  const result = await pool.query(PROJECT_QUERIES.deleteProject, [projectId]);
  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get projects by cluster
 */
export const getProjectsByCluster = async (
  cluster: string,
): Promise<ProjectWithDetails[]> => {
  const result = await pool.query(PROJECT_QUERIES.getProjectsByCluster, [
    cluster,
  ]);
  return result.rows;
};

/**
 * Get active projects
 */
export const getActiveProjects = async (): Promise<ProjectWithDetails[]> => {
  const result = await pool.query(PROJECT_QUERIES.getActiveProjects);
  return result.rows;
};

/**
 * Get projects by account manager
 */
export const getProjectsByAccountManager = async (
  accountManagerId: number,
): Promise<ProjectWithDetails[]> => {
  const result = await pool.query(PROJECT_QUERIES.getProjectsByAccountManager, [
    accountManagerId,
  ]);
  return result.rows;
};

/**
 * Get project timesheets
 */
export const getProjectTimesheets = async (
  projectId: number,
): Promise<any[]> => {
  const result = await pool.query(PROJECT_QUERIES.getProjectTimesheets, [
    projectId,
  ]);
  return result.rows;
};

/**
 * Get project staff breakdown
 */
export const getProjectStaffBreakdown = async (
  projectId: number,
): Promise<any[]> => {
  const result = await pool.query(PROJECT_QUERIES.getProjectStaffBreakdown, [
    projectId,
  ]);
  return result.rows;
};
