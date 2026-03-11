import { pool } from "../config/database";
import { ApiError } from "../middleware";
import { CLIENT_QUERIES } from "../queries/client.queries";

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
  const result = await pool.query(CLIENT_QUERIES.getAllClients);
  return result.rows;
};

/**
 * Get client by ID
 */
export const getClientById = async (
  clientId: number,
): Promise<ClientWithDetails | null> => {
  const result = await pool.query(CLIENT_QUERIES.getClientById, [clientId]);
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
    CLIENT_QUERIES.checkAccountManagerExists,
    [account_manager_id],
  );
  if (managerCheck.rows.length === 0) {
    throw new ApiError(400, "Account manager ID does not exist");
  }

  const result = await pool.query(CLIENT_QUERIES.createClient, [
    client_name,
    sector,
    category,
    account_manager_id,
    entry_date || new Date().toISOString().split("T")[0],
  ]);

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
      CLIENT_QUERIES.checkAccountManagerExists,
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

  const updateQuery = `
    UPDATE clients
    SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
    WHERE client_id = $${paramCount}
    RETURNING *
  `;

  const result = await pool.query(updateQuery, values);
  return result.rows[0];
};

/**
 * Delete client
 */
export const deleteClient = async (clientId: number): Promise<boolean> => {
  // Check if client has projects
  const projectCheck = await pool.query(CLIENT_QUERIES.checkClientHasProjects, [
    clientId,
  ]);
  if (parseInt(projectCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete client with existing projects. Delete projects first.",
    );
  }

  // Check if client has timesheets
  const timesheetCheck = await pool.query(
    CLIENT_QUERIES.checkClientHasTimesheets,
    [clientId],
  );
  if (parseInt(timesheetCheck.rows[0].count) > 0) {
    throw new ApiError(
      400,
      "Cannot delete client with existing timesheet entries.",
    );
  }

  const result = await pool.query(CLIENT_QUERIES.deleteClient, [clientId]);
  return result.rowCount !== null && result.rowCount > 0;
};

/**
 * Get clients by sector
 */
export const getClientsBySector = async (
  sector: string,
): Promise<ClientWithDetails[]> => {
  const result = await pool.query(CLIENT_QUERIES.getClientsBySector, [sector]);
  return result.rows;
};

/**
 * Get clients by category
 */
export const getClientsByCategory = async (
  category: string,
): Promise<ClientWithDetails[]> => {
  const result = await pool.query(CLIENT_QUERIES.getClientsByCategory, [
    category,
  ]);
  return result.rows;
};

/**
 * Get client projects
 */
export const getClientProjects = async (clientId: number): Promise<any[]> => {
  const result = await pool.query(CLIENT_QUERIES.getClientProjects, [clientId]);
  return result.rows;
};
