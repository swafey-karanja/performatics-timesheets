import { Client, Project } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

/**
 * Fetch all clients from the database
 */
export async function getAllClients(): Promise<Client[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/clients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch clients: ${response.statusText}`);
    }

    const data = await response.json();
    return data.clients;
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
}

/**
 * Fetch client projects from the database
 */

interface ClientProps {
  id: number;
}
export async function getClientProjects({
  id,
}: ClientProps): Promise<Project[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/clients/${id}/projects`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch client projects: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.projects;
  } catch (error) {
    console.error("Error fetching client projects:", error);
    throw error;
  }
}
