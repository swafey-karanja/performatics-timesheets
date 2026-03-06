import { getAuthHeaders } from "@/lib/utils";
import { Client, Project } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:3000/api";

export async function fetchClients(): Promise<Client[]> {
  const res = await fetch(`${API_BASE_URL}/clients`, {
    headers: getAuthHeaders()
  });
  if (!res.ok) throw new Error(`Failed to fetch clients: ${res.status}`);

  const json = await res.json();

   return json.clients as Client[];
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
      headers: getAuthHeaders()
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
