// Define the union type
export type TaskType =
  | "creative"
  | "project management"
  | "accounts & finance"
  | "admin"
  | "admin meeting"
  | "client service"
  | "discovery meeting"
  | "business development meeting"
  | "project meeting"
  | "procurement"
  | "HR"
  | "proposal development"
  | "report writing"
  | "report review"
  | "presentation development";

export type Department =
  | "board"
  | "business development"
  | "design, branding & printing"
  | "events management & PR"
  | "finance, HR, procurement & admin"
  | "marketing & advertising"
  | "video production, animation & photography"
  | "web & digital solutions";

// export an array of all type options for mapping
export const TASK_OPTIONS: TaskType[] = [
  "creative",
  "project management",
  "accounts & finance",
  "admin",
  "admin meeting",
  "client service",
  "discovery meeting",
  "business development meeting",
  "project meeting",
  "procurement",
  "HR",
  "proposal development",
  "report writing",
  "report review",
  "presentation development",
];

export const DEPARTMENT_OPTIONS: Department[] = [
  "board",
  "business development",
  "design, branding & printing",
  "events management & PR",
  "finance, HR, procurement & admin",
  "marketing & advertising",
  "video production, animation & photography",
  "web & digital solutions",
];

// types/payload.ts
export interface FormPayload {
  "form-id": string;
  "lead-id": string | null;
  "field-ids": string[];
  "gravityview-meta": boolean;
  "field-values": Record<string, string | string[]>; // field 9 and 11 are arrays, others are strings
  "merge-tags": string[];
  "lmt-nonces": Record<string, string>;
  "current-merge-tag-values": Record<string, string>;
  security: string;
  show_admin_fields_in_ajax: string;
}

// types/api.ts
export interface ApiResponse {
  fields: Record<string, string>; // field id => HTML string
  merge_tag_values: Record<string, string>;
  config: unknown; // config object is large, optional to type in detail
}

// For SWR, the projects we extract are just strings
export type ProjectType = string[];
