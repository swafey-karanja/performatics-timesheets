// Define the union type
export type TaskType = string;

export type Department = string;

export type StrategicPillar = string;

export type Client = string;

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

export const STRATEGIC_PILLARS: StrategicPillar[] = [
  "startegic partnerships",
  "innovation & digital transformation",
  "community involvement & CSR",
  "thought leadership",
  "business development",
  "service excellence and service delivery",
  "growth and profitability",
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

export interface TaskDescrioptionEditorProps {
  taskDescription: string;
  setTaskDescription: (value: string) => void;
  isSubmitting: boolean;
}
