import { pool } from "../config/database";
import { ApiError } from "../middleware";

/**
 * Client Service
 * Contains business logic for client operations
 */

export interface Client {
  client_id?: number;
  client_name: string;
  sector: "Non-profit" | "Individual" | "Startup" | "Government";
  category: "Converted" | "Prospect";
  account_manager_id: number;
  entry_date?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface ClientWithDetails extends Client {
  account_manager_name?: string;
  account_manager_email?: string;
  project_count?: number;
  total_hours?: number;
}

/**
 * Get all clients with account manager details
 */
export const getAllClients = async (): Promise<ClientWithDetails[]> => {
  const query = `
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
      sa.work_email AS account_manager_email,
      COUNT(DISTINCT p.project_id) AS project_count,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours
    FROM clients c
    INNER JOIN staff_accounts sa ON c.account_manager_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN projects p ON c.client_id = p.client_id
    LEFT JOIN timesheets t ON c.client_id = t.client_id
    GROUP BY 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      c.created_at,
      c.updated_at,
      sd.staff_name,
      sa.work_email
    ORDER BY c.client_name
  `;

  const result = await pool.query(query);
  return result.rows;
};

/**
 * Get client by ID
 */
export const getClientById = async (
  clientId: number,
): Promise<ClientWithDetails | null> => {
  const query = `
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
      sa.work_email AS account_manager_email,
      COUNT(DISTINCT p.project_id) AS project_count,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours
    FROM clients c
    INNER JOIN staff_accounts sa ON c.account_manager_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN projects p ON c.client_id = p.client_id
    LEFT JOIN timesheets t ON c.client_id = t.client_id
    WHERE c.client_id = $1
    GROUP BY 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      c.created_at,
      c.updated_at,
      sd.staff_name,
      sa.work_email
  `;

  const result = await pool.query(query, [clientId]);
  return result.rows.length > 0 ? result.rows[0] : null;
};

/**
 * Create new client
 */
export const createClient = async (clientData: Client): Promise<Client> => {
  const { client_name, sector, category, account_manager_id, entry_date } =
    clientData;

  // Validate sector
  const validSectors = ["Non-profit", "Individual", "Startup", "Government"];
  if (!validSectors.includes(sector)) {
    throw new ApiError(
      400,
      `Invalid sector. Must be one of: ${validSectors.join(", ")}`,
    );
  }

  // Validate category
  const validCategories = ["Converted", "Prospect"];
  if (!validCategories.includes(category)) {
    throw new ApiError(
      400,
      `Invalid category. Must be one of: ${validCategories.join(", ")}`,
    );
  }

  // Verify account manager exists
  const managerCheck = await pool.query(
    "SELECT account_id FROM staff_accounts WHERE account_id = $1",
    [account_manager_id],
  );

  if (managerCheck.rows.length === 0) {
    throw new ApiError(400, "Account manager ID does not exist");
  }

  const query = `
    INSERT INTO clients (
      client_name, sector, category, account_manager_id, entry_date
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *
  `;

  const values = [
    client_name,
    sector,
    category,
    account_manager_id,
    entry_date || new Date().toISOString().split("T")[0],
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Update client
 */
export const updateClient = async (
  clientId: number,
  clientData: Partial<Client>,
): Promise<Client | null> => {
  // Check if client exists
  const existingClient = await getClientById(clientId);
  if (!existingClient) {
    return null;
  }

  // Validate sector if provided
  if (clientData.sector) {
    const validSectors = ["Non-profit", "Individual", "Startup", "Government"];
    if (!validSectors.includes(clientData.sector)) {
      throw new ApiError(
        400,
        `Invalid sector. Must be one of: ${validSectors.join(", ")}`,
      );
    }
  }

  // Validate category if provided
  if (clientData.category) {
    const validCategories = ["Converted", "Prospect"];
    if (!validCategories.includes(clientData.category)) {
      throw new ApiError(
        400,
        `Invalid category. Must be one of: ${validCategories.join(", ")}`,
      );
    }
  }

  // Verify account manager if provided
  if (clientData.account_manager_id) {
    const managerCheck = await pool.query(
      "SELECT account_id FROM staff_accounts WHERE account_id = $1",
      [clientData.account_manager_id],
    );

    if (managerCheck.rows.length === 0) {
      throw new ApiError(400, "Account manager ID does not exist");
    }
  }

  // Build dynamic update query
  const updateFields: string[] = [];
  const values: any[] = [];
  let paramCount = 1;

  Object.entries(clientData).forEach(([key, value]) => {
    if (value !== undefined && key !== "client_id") {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  if (updateFields.length === 0) {
    throw new ApiError(400, "No fields to update");
  }

  values.push(clientId);

  const query = `
    UPDATE clients 
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE client_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

/**
 * Delete client
 */
export const deleteClient = async (clientId: number): Promise<boolean> => {
  // Check if client has projects
  const projectCheck = await pool.query(
    "SELECT COUNT(*) FROM projects WHERE client_id = $1",
    [clientId],
  );

  if (parseInt(projectCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete client with existing projects. Delete projects first.",
    );
  }

  // Check if client has timesheets
  const timesheetCheck = await pool.query(
    "SELECT COUNT(*) FROM timesheets WHERE client_id = $1",
    [clientId],
  );

  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete client with existing timesheet entries.",
    );
  }

  const result = await pool.query(
    "DELETE FROM clients WHERE client_id = $1 RETURNING client_id",
    [clientId],
  );

  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get clients by sector
 */
export const getClientsBySector = async (
  sector: string,
): Promise<ClientWithDetails[]> => {
  const query = `
    SELECT 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name AS account_manager_name,
      sa.work_email AS account_manager_email,
      COUNT(DISTINCT p.project_id) AS project_count
    FROM clients c
    INNER JOIN staff_accounts sa ON c.account_manager_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN projects p ON c.client_id = p.client_id
    WHERE c.sector = $1
    GROUP BY 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name,
      sa.work_email
    ORDER BY c.client_name
  `;

  const result = await pool.query(query, [sector]);
  return result.rows;
};

/**
 * Get clients by category
 */
export const getClientsByCategory = async (
  category: string,
): Promise<ClientWithDetails[]> => {
  const query = `
    SELECT 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name AS account_manager_name,
      sa.work_email AS account_manager_email,
      COUNT(DISTINCT p.project_id) AS project_count
    FROM clients c
    INNER JOIN staff_accounts sa ON c.account_manager_id = sa.account_id
    INNER JOIN staff_details sd ON sa.staff_id = sd.staff_id
    LEFT JOIN projects p ON c.client_id = p.client_id
    WHERE c.category = $1
    GROUP BY 
      c.client_id,
      c.client_name,
      c.sector,
      c.category,
      c.account_manager_id,
      c.entry_date,
      sd.staff_name,
      sa.work_email
    ORDER BY c.client_name
  `;

  const result = await pool.query(query, [category]);
  return result.rows;
};

/**
 * Get client projects
 */
export const getClientProjects = async (clientId: number): Promise<any[]> => {
  const query = `
    SELECT 
      p.project_id,
      p.project_name,
      p.start_date,
      p.end_date,
      p.cluster,
      COALESCE(SUM(t.hours_spent), 0) AS total_hours,
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
  `;

  const result = await pool.query(query, [clientId]);
  return result.rows;
};
