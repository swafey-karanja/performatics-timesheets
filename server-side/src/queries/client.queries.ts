/**
 * Client Service — SQL query strings
 *
 * Centralises all raw SQL used by client.service.ts.
 */

/** Shared SELECT + JOIN fragment reused by list and single-record queries */
const CLIENT_SELECT_FROM = `
  SELECT
    c.client_id,
    c.client_name,
    c.sector,
    c.category,
    c.account_manager_id,
    c.entry_date,
    c.created_at,
    c.updated_at,
    sd.staff_name AS account_manager_name,
    COUNT(DISTINCT p.project_id) AS project_count
  FROM clients c
  INNER JOIN staff_details sd ON c.account_manager_id = sd.staff_id
  LEFT  JOIN projects p       ON c.client_id = p.client_id
  LEFT  JOIN timesheets t     ON c.client_id = t.client_id
`;

const CLIENT_GROUP_BY = `
  GROUP BY
    c.client_id,
    c.client_name,
    c.sector,
    c.category,
    c.account_manager_id,
    c.entry_date,
    c.created_at,
    c.updated_at,
    sd.staff_name
`;

export const CLIENT_QUERIES = {
  /**
   * Return all clients with account manager name and project count
   */
  getAllClients: `
    ${CLIENT_SELECT_FROM}
    ${CLIENT_GROUP_BY}
    ORDER BY c.client_name
  `,

  /**
   * Return a single client by primary key with account manager name and project count
   */
  getClientById: `
    ${CLIENT_SELECT_FROM}
    WHERE c.client_id = $1
    ${CLIENT_GROUP_BY}
  `,

  /**
   * Verify that a staff member exists (used to validate account_manager_id)
   */
  checkAccountManagerExists: `
    SELECT staff_id
    FROM staff_details
    WHERE staff_id = $1
  `,

  /**
   * Insert a new client and return all columns
   */
  createClient: `
    INSERT INTO clients (client_name, sector, category, account_manager_id, entry_date)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `,

  /**
   * Check whether a project exists for a client (used before deletion)
   */
  checkClientHasProjects: `
    SELECT COUNT(*) AS count
    FROM projects
    WHERE client_id = $1
  `,

  /**
   * Check whether timesheet entries reference a client (used before deletion)
   */
  checkClientHasTimesheets: `
    SELECT COUNT(*) AS count
    FROM timesheets
    WHERE client_id = $1
  `,

  /**
   * Delete a client by primary key and return the deleted ID
   */
  deleteClient: `
    DELETE FROM clients
    WHERE client_id = $1
    RETURNING client_id
  `,

  /**
   * Return all clients filtered by sector, with account manager name and project count
   */
  getClientsBySector: `
    SELECT
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name AS account_manager_name,
      COUNT(DISTINCT p.project_id) AS project_count
    FROM clients c
    INNER JOIN staff_details sd ON c.account_manager_id = sd.staff_id
    LEFT  JOIN projects p       ON c.client_id = p.client_id
    WHERE c.sector = $1
    GROUP BY
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name
    ORDER BY c.client_name
  `,

  /**
   * Return all clients filtered by category, with account manager name and project count
   */
  getClientsByCategory: `
    SELECT
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name AS account_manager_name,
      COUNT(DISTINCT p.project_id) AS project_count
    FROM clients c
    INNER JOIN staff_details sd ON c.account_manager_id = sd.staff_id
    LEFT  JOIN projects p       ON c.client_id = p.client_id
    WHERE c.category = $1
    GROUP BY
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name
    ORDER BY c.client_name
  `,

  /**
   * Return all projects belonging to a client with staff and activity counts
   */
  getClientProjects: `
    SELECT
      p.project_id,
      p.project_name,
      p.start_date,
      p.end_date,
      p.cluster,
      COUNT(DISTINCT t.staff_id) AS staff_count
    FROM projects p
    LEFT JOIN timesheets t ON p.project_id = t.project_id
    WHERE p.client_id = $1
    GROUP BY
      p.project_id,
      p.project_name,
      p.start_date,
      p.end_date,
      p.cluster
    ORDER BY p.start_date DESC
  `,
} as const;
