// services/taskService.ts
import { ApiResponse, FormPayload, ProjectType } from "../types/types";

/**
 * Fetch tasks for a given client from the API.
 *
 * @param client - The currently selected client (used in field-values.68)
 * @param basePayload - Base payload template to send to the API
 * @param cookie - Cookie string required by the API
 * @returns Promise resolving to ProjectType[]
 */
export const fetchClientProjects = async (
  client: string,
  basePayload: FormPayload,
  cookie: string,
): Promise<ProjectType> => {
  // Clone the base payload and dynamically update the client field
  const payload: FormPayload = {
    ...basePayload,
    "field-values": {
      ...basePayload["field-values"],
      "68": client, // The key field that determines which projects are returned
    },
  };

  console.log({ cookie });

  // Make the POST request
  const response = await fetch(
    "https://mediaforce.cloud/wp-admin/admin-ajax.php?action=gppa_get_batch_field_html",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookie, // API requires authentication via cookie
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch tasks for client ${client}`);
  }

  const data: ApiResponse = await response.json();

  // Extract tasks from fields["14"] HTML
  const htmlString = data.fields["14"];
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const optionElements = Array.from(doc.querySelectorAll("option"));

  // Filter out placeholder options with empty value
  const projects: ProjectType = optionElements
    .map((opt) => opt.value)
    .filter((v) => v && v.trim() !== "");

  return projects;
};
