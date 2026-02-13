import { Department } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

/**
 * Fetch all projects from the database
 */
export async function getAllDepartments(): Promise<Department[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/departments`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch departments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.departments;
  } catch (error) {
    console.error("Error fetching departments:", error);
    throw error;
  }
}
