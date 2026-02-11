import { pool } from "../config/database";
import { ApiError } from "../middleware";

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
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector AS client_sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      p.created_at,
      p.updated_at,
      am_sd.staff_name AS account_manager_name,
      am_sa.work_email AS account_manager_email,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      COUNT(t.timesheet_id) AS timesheet_count,
      CASE 
        WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true 
        ELSE false 
      END AS is_active
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN staff_accounts am_sa ON p.account_manager = am_sa.account_id
    LEFT JOIN staff_details am_sd ON am_sa.staff_id = am_sd.staff_id
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    GROUP BY 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      p.created_at,
      p.updated_at,
      am_sd.staff_name,
      am_sa.work_email
    ORDER BY p.start_date DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get project by ID
 */
export const getProjectById = async (
  projectId: number,
): Promise<ProjectWithDetails | null> => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector AS client_sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      p.created_at,
      p.updated_at,
      am_sd.staff_name AS account_manager_name,
      am_sa.work_email AS account_manager_email,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      COUNT(t.timesheet_id) AS timesheet_count,
      CASE 
        WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true 
        ELSE false 
      END AS is_active
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN staff_accounts am_sa ON p.account_manager = am_sa.account_id
    LEFT JOIN staff_details am_sd ON am_sa.staff_id = am_sd.staff_id
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    WHERE p.project_id = $1
    GROUP BY 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      p.created_at,
      p.updated_at,
      am_sd.staff_name,
      am_sa.work_email
  `;

  const result = await pool.query(query, [projectId]);
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
  const clientCheck = await pool.query(
    "SELECT client_id FROM clients WHERE client_id = $1",
    [client_id],
  );

  if (clientCheck.rows.length === 0) {
    throw new ApiError(400, "Client ID does not exist");
  }

  // Verify account manager exists if provided
  if (account_manager) {
    const managerCheck = await pool.query(
      "SELECT account_id FROM staff_accounts WHERE account_id = $1",
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

  const query = `
    INSERT INTO projects (
      project_name, client_id, start_date, end_date, cluster, account_manager
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `;

  const values = [
    project_name,
    client_id,
    start_date,
    end_date || null,
    cluster,
    account_manager || null,
  ];

  const result = await pool.query(query, values);
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
    const clientCheck = await pool.query(
      "SELECT client_id FROM clients WHERE client_id = $1",
      [projectData.client_id],
    );

    if (clientCheck.rows.length === 0) {
      throw new ApiError(400, "Client ID does not exist");
    }
  }

  // Verify account manager if provided
  if (projectData.account_manager !== undefined) {
    if (projectData.account_manager !== null) {
      const managerCheck = await pool.query(
        "SELECT account_id FROM staff_accounts WHERE account_id = $1",
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

  const query = `
    UPDATE projects 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE project_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete project
 */
export const deleteProject = async (projectId: number): Promise<boolean> => {
  // Check if project has timesheets
  const timesheetCheck = await pool.query(
    "SELECT COUNT(*) FROM timesheets WHERE project_id = $1",
    [projectId],
  );

  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete project with existing timesheet entries.",
    );
  }

  const result = await pool.query(
    "DELETE FROM projects WHERE project_id = $1 RETURNING project_id",
    [projectId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get projects by cluster
 */
export const getProjectsByCluster = async (
  cluster: string,
): Promise<ProjectWithDetails[]> => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name AS account_manager_name,
      am_sa.work_email AS account_manager_email,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      CASE 
        WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true 
        ELSE false 
      END AS is_active
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN staff_accounts am_sa ON p.account_manager = am_sa.account_id
    LEFT JOIN staff_details am_sd ON am_sa.staff_id = am_sd.staff_id
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    WHERE p.cluster = $1
    GROUP BY 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name,
      am_sa.work_email
    ORDER BY p.start_date DESC
  `;

  const result = await pool.query(query, [cluster]);
  return result.rows;
};

/**
 * Get active projects
 */
export const getActiveProjects = async (): Promise<ProjectWithDetails[]> => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name AS account_manager_name,
      am_sa.work_email AS account_manager_email,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      true AS is_active
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN staff_accounts am_sa ON p.account_manager = am_sa.account_id
    LEFT JOIN staff_details am_sd ON am_sa.staff_id = am_sd.staff_id
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    WHERE p.end_date IS NULL OR p.end_date >= CURRENT_DATE
    GROUP BY 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name,
      am_sa.work_email
    ORDER BY p.start_date DESC
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get projects by account manager
 */
export const getProjectsByAccountManager = async (
  accountManagerId: number,
): Promise<ProjectWithDetails[]> => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector AS client_sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name AS account_manager_name,
      am_sa.work_email AS account_manager_email,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id) AS staff_count,
      COUNT(t.timesheet_id) AS timesheet_count,
      CASE 
        WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true 
        ELSE false 
      END AS is_active
    FROM projects p
    INNER JOIN clients c ON p.client_id = c.client_id
    LEFT JOIN staff_accounts am_sa ON p.account_manager = am_sa.account_id
    LEFT JOIN staff_details am_sd ON am_sa.staff_id = am_sd.staff_id
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    WHERE p.account_manager = $1
    GROUP BY 
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      c.sector,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager,
      am_sd.staff_name,
      am_sa.work_email
    ORDER BY p.start_date DESC
  `;

  const result = await pool.query(query, [accountManagerId]);
  return result.rows;
};

/**
 * Get project timesheets
 */
export const getProjectTimesheets = async (
  projectId: number,
): Promise<any[]> => {
  const query = `
    SELECT 
      t.timesheet_id,
      t.staff_id,
      sd.staff_name,
      t.task_description,
      t.task_type,
      t.date,
      t.hours_spent,
      d.department_name
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    INNER JOIN departments d ON t.department_id = d.department_id
    WHERE t.project_id = $1
    ORDER BY t.date DESC
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows;
};

/**
 * Get project staff breakdown
 */
export const getProjectStaffBreakdown = async (
  projectId: number,
): Promise<any[]> => {
  const query = `
    SELECT 
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      d.department_name,
      SUM(t.hours_spent) AS total_hours,
      COUNT(t.timesheet_id) AS entry_count
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id = sd.staff_id
    INNER JOIN departments d ON t.department_id = d.department_id
    WHERE t.project_id = $1
    GROUP BY 
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      d.department_name
    ORDER BY total_hours DESC
  `;

  const result = await pool.query(query, [projectId]);
  return result.rows;
};
