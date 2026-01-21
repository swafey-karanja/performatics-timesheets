import { ProjectType, FormPayload } from "../types/types";

/**
 * Mock fetchClientProjects for local development
 */
export const fetchClientProjectsMock = async (
  client: string,
  basePayload: FormPayload,
): Promise<ProjectType> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // The HTML from your Postman response
  const htmlString = `
    <div class='ginput_container ginput_container_select'>
      <select name='input_14' id='input_52_14' class='large gfield_select'>
        <option value='' selected='selected'>Choose a project relevant to the task</option>
        <option value='Documentation of the Gaming Tech Summit Africa (GTSA) on June 3rd, 4th 2025'>Documentation of the Gaming Tech Summit Africa (GTSA) on June 3rd, 4th 2025</option>
        <option value='iGaming Afrika Summit 2026'>iGaming Afrika Summit 2026</option>
        <option value='iGaming Afrika Summit 2026 website development'>iGaming Afrika Summit 2026 website development</option>
        <option value='iGaming Afrika Summit Nairobi 2026'>iGaming Afrika Summit Nairobi 2026</option>
      </select>
    </div>
  `;

  // Simple DOM parsing as your real service does
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, "text/html");

  const optionElements = Array.from(doc.querySelectorAll("option"));

  const projects: ProjectType = optionElements
    .map((opt) => opt.value)
    .filter((v) => v && v.trim() !== "");

  return projects;
};
