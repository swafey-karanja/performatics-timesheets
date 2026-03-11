/**
 * Project Service — SQL query strings
 *
 * Centralises all raw SQL used by projects.service.ts.
 */

/** Columns and joins shared across project list/detail queries */
const PROJECT_SELECT_FROM = `
  SELECT
    p.project_id,
    p.project_name,
    p.client_id,
    c.client_name,
    c.sector                              AS client_sector,
    p.start_date,
    p.end_date,
    p.cluster,
    p.account_manager_id,
    sd.staff_name                         AS account_manager_name,
    p.created_at,
    p.updated_at,
    COALESCE(SUM(t.hours_spent), 0)       AS total_hours,
    COUNT(DISTINCT t.staff_id)            AS staff_count,
    COUNT(t.timesheet_id)                 AS timesheet_count,
    CASE
      WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true
      ELSE false
    END                                   AS is_active
  FROM projects p
  INNER JOIN clients      c  ON p.client_id          = c.client_id
  LEFT  JOIN staff_details sd ON p.account_manager_id = sd.staff_id
  LEFT  JOIN timesheets   t  ON p.project_id          = t.project_id
`;

const PROJECT_GROUP_BY = `
  GROUP BY
    p.project_id,
    p.project_name,
    p.client_id,
    c.client_name,
    c.sector,
    p.start_date,
    p.end_date,
    p.cluster,
    p.account_manager_id,
    sd.staff_name,
    p.created_at,
    p.updated_at
`;

export const PROJECT_QUERIES = {
  /**
   * Return all projects with client info, account manager, and aggregated stats
   */
  getAllProjects: `
    ${PROJECT_SELECT_FROM}
    ${PROJECT_GROUP_BY}
    ORDER BY p.start_date DESC
  `,

  /**
   * Return a single project by primary key with full details and aggregated stats
   */
  getProjectById: `
    ${PROJECT_SELECT_FROM}
    WHERE p.project_id = $1
    ${PROJECT_GROUP_BY}
  `,

  /**
   * Verify that a client exists (used to validate client_id on create/update)
   */
  checkClientExists: `
    SELECT client_id
    FROM clients
    WHERE client_id = $1
  `,

  /**
   * Verify that a staff account exists to serve as account manager
   */
  checkAccountManagerExists: `
    SELECT account_id
    FROM staff_accounts
    WHERE account_id = $1
  `,

  /**
   * Insert a new project and return all columns
   */
  createProject: `
    INSERT INTO projects (project_name, client_id, start_date, end_date, cluster, account_manager)
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *
  `,

  /**
   * Check whether timesheet entries reference a project (used before deletion)
   */
  checkProjectHasTimesheets: `
    SELECT COUNT(*) AS count
    FROM timesheets
    WHERE project_id = $1
  `,

  /**
   * Delete a project by primary key and return the deleted ID
   */
  deleteProject: `
    DELETE FROM projects
    WHERE project_id = $1
    RETURNING project_id
  `,

  /**
   * Return all projects filtered by cluster with aggregated stats
   */
  getProjectsByCluster: `
    SELECT
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager_id,
      sd.staff_name                   AS account_manager_name,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id)      AS staff_count,
      CASE
        WHEN p.end_date IS NULL OR p.end_date >= CURRENT_DATE THEN true
        ELSE false
      END                             AS is_active
    FROM projects p
    INNER JOIN clients       c  ON p.client_id          = c.client_id
    LEFT  JOIN staff_details sd ON p.account_manager_id = sd.staff_id
    LEFT  JOIN timesheets    t  ON p.project_id         = t.project_id
    WHERE p.cluster = $1
    GROUP BY
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager_id,
      sd.staff_name
    ORDER BY p.start_date DESC
  `,

  /**
   * Return all projects that are currently active (no end date or end date in the future)
   */
  getActiveProjects: `
    SELECT
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager_id,
      sd.staff_name                   AS account_manager_name,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
      COUNT(DISTINCT t.staff_id)      AS staff_count,
      true                            AS is_active
    FROM projects p
    INNER JOIN clients       c  ON p.client_id          = c.client_id
    LEFT  JOIN staff_details sd ON p.account_manager_id = sd.staff_id
    LEFT  JOIN timesheets    t  ON p.project_id         = t.project_id
    WHERE p.end_date IS NULL OR p.end_date >= CURRENT_DATE
    GROUP BY
      p.project_id,
      p.project_name,
      p.client_id,
      c.client_name,
      p.start_date,
      p.end_date,
      p.cluster,
      p.account_manager_id,
      sd.staff_name
    ORDER BY p.start_date DESC
  `,

  /**
   * Return all projects managed by a specific account manager with aggregated stats
   */
  getProjectsByAccountManager: `
    ${PROJECT_SELECT_FROM}
    WHERE p.account_manager_id = $1
    ${PROJECT_GROUP_BY}
    ORDER BY p.start_date DESC
  `,

  /**
   * Return all timesheet entries for a project with staff and department info
   */
  getProjectTimesheets: `
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
    INNER JOIN staff_details sd ON t.staff_id      = sd.staff_id
    INNER JOIN departments   d  ON t.department_id = d.department_id
    WHERE t.project_id = $1
    ORDER BY t.date DESC
  `,

  /**
   * Return per-staff hour totals and entry counts for a project
   */
  getProjectStaffBreakdown: `
    SELECT
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      d.department_name,
      SUM(t.hours_spent)    AS total_hours,
      COUNT(t.timesheet_id) AS entry_count
    FROM timesheets t
    INNER JOIN staff_details sd ON t.staff_id      = sd.staff_id
    INNER JOIN departments   d  ON t.department_id = d.department_id
    WHERE t.project_id = $1
    GROUP BY
      sd.staff_id,
      sd.staff_name,
      sd.staff_role,
      d.department_name
    ORDER BY total_hours DESC
  `,
} as const;
