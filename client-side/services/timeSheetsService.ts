import { getAuthHeaders } from "@/lib/utils";
import { PaginatedTimesheets, TimesheetQueryParams } from "@/types/timesheets.types";
import { Timesheet, TimesheetCreateData } from "@/types/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BACKEND_URL || "http://localhost:3000/api";



// ─── Helpers ───────────────────────────────────────────────────────────────────

function buildQueryString(params: TimesheetQueryParams): string {
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length === 0) return "";
  return "?" + new URLSearchParams(entries.map(([k, v]) => [k, String(v)])).toString();
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message ?? `Request failed with status ${res.status}`);
  }
  const json = await res.json();
  return json as T;
}

// ─── Service functions ─────────────────────────────────────────────────────────

/**
 * Fetch all timesheets with optional filtering, sorting, and pagination.
 * Maps to: GET /api/timesheets
 */
export async function fetchTimesheets(
  params: TimesheetQueryParams = {}
): Promise<PaginatedTimesheets> {
  const qs = buildQueryString(params);
  const res = await fetch(`${API_BASE_URL}/timesheets${qs}`, {
    headers: getAuthHeaders(),
  });
  const body = await handleResponse<{ status: string } & PaginatedTimesheets>(res);
  return { data: body.data, pagination: body.pagination };
}

/**
 * Fetch timesheets scoped to a single staff member.
 * Maps to: GET /api/timesheets/staff/:staffId
 */
export async function fetchTimesheetsByStaffId(
  staffId: number,
  params: Omit<TimesheetQueryParams, "staffId"> = {}
): Promise<PaginatedTimesheets> {
  const qs = buildQueryString(params);
  const res = await fetch(`${API_BASE_URL}/timesheets/staff/${staffId}${qs}`, {
    headers: getAuthHeaders(),
  });
  const body = await handleResponse<{ status: string } & PaginatedTimesheets>(res);
  return { data: body.data, pagination: body.pagination };
}


/**
 * Create a new timesheet entry
 */
export async function createTimesheet(
  timesheetData: TimesheetCreateData,
): Promise<Timesheet> {
  try {
    const response = await fetch(`${API_BASE_URL}/timesheets`, {
      method: "POST",
       headers: getAuthHeaders(),
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



