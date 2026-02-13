import { Request, Response } from "express";
import * as clientService from "../services/client.service";
import { ApiError } from "../middleware";

/**
 * Client Controllers
 * Handle HTTP requests and responses for client-related operations
 */

/**
 * Get all clients
 * @route GET /api/clients
 */
export const getAllClients = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const clients = await clientService.getAllClients();

  res.status(200).json({
    clients,
    count: clients.length,
  });
};

/**
 * Get client by ID
 * @route GET /api/clients/:id
 */
export const getClientById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const client = await clientService.getClientById(parseInt(id));

  if (!client) {
    throw new ApiError(404, `Client with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    data: client,
  });
};

/**
 * Create new client
 * @route POST /api/clients
 */
export const createClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const clientData = req.body;
  const newClient = await clientService.createClient(clientData);

  res.status(201).json({
    status: "success",
    message: "Client created successfully",
    data: newClient,
  });
};

/**
 * Update client
 * @route PUT /api/clients/:id
 */
export const updateClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const clientData = req.body;

  const updatedClient = await clientService.updateClient(
    parseInt(id),
    clientData,
  );

  if (!updatedClient) {
    throw new ApiError(404, `Client with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Client updated successfully",
    data: updatedClient,
  });
};

/**
 * Delete client
 * @route DELETE /api/clients/:id
 */
export const deleteClient = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;
  const deleted = await clientService.deleteClient(parseInt(id));

  if (!deleted) {
    throw new ApiError(404, `Client with ID ${id} not found`);
  }

  res.status(200).json({
    status: "success",
    message: "Client deleted successfully",
  });
};

/**
 * Get clients by sector
 * @route GET /api/clients/sector/:sector
 */
export const getClientsBySector = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { sector } = req.params;
  const clients = await clientService.getClientsBySector(sector);

  res.status(200).json({
    status: "success",
    data: clients,
    count: clients.length,
  });
};

/**
 * Get clients by category
 * @route GET /api/clients/category/:category
 */
export const getClientsByCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { category } = req.params;
  const clients = await clientService.getClientsByCategory(category);

  res.status(200).json({
    status: "success",
    data: clients,
    count: clients.length,
  });
};

/**
 * Get client projects
 * @route GET /api/clients/:id/projects
 */
export const getClientProjects = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const { id } = req.params;

  // First check if client exists
  const client = await clientService.getClientById(parseInt(id));
  if (!client) {
    throw new ApiError(404, `Client with ID ${id} not found`);
  }

  const projects = await clientService.getClientProjects(parseInt(id));

  res.status(200).json({
    projects,
    count: projects.length,
  });
};
