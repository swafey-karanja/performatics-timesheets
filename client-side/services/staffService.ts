import { getAuthHeaders } from "@/lib/utils";
import { Staff, StaffAccount } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:3000/api";

/**
 * Fetch all staff members from the database
 */
export async function getAllStaff(): Promise<Staff[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/staff`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staff details: ${response.statusText}`);
    }

    const data = await response.json();
    console.log({data})
    return data.staff;
  } catch (error) {
    console.error("Error fetching staff details:", error);
    throw error;
  }
}


/**
 * Fetch all staff members accounts from the database
 */
export async function getAllStaffAccounts(): Promise<StaffAccount[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/staff/accounts`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch staff accounts: ${response.statusText}`);
    }

    const data = await response.json();
    console.log({data})
    return data.staff;
  } catch (error) {
    console.error("Error fetching staff accounts:", error);
    throw error;
  }
}
