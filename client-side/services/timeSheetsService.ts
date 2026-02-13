import { Timesheet, TimesheetCreateData } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000/api";

/**
 * Create a new timesheet entry
 */
export async function createTimesheet(
  timesheetData: TimesheetCreateData,
): Promise<Timesheet> {
  try {
    const response = await fetch(`${API_BASE_URL}/timesheets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(timesheetData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to create timesheet: ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data.newTimesheet; // Assuming backend returns { status: "success", data: {...} }
  } catch (error) {
    console.error("Error creating timesheet:", error);
    throw error;
  }
}
