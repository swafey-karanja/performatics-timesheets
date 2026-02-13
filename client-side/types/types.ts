// Define the union type
export type TaskType = string;

export type StrategicPillar = string;

// export an array of all type options for mapping
export const TASK_OPTIONS: TaskType[] = [
  "Creative",
  "Project management",
  "Accounts & finance",
  "Admin",
  "Admin meeting",
  "Client service",
  "Discovery meeting",
  "Business development meeting",
  "Project meeting",
  "Procurement",
  "HR",
  "Proposal development",
  "Report writing",
  "Report review",
  "Presentation development",
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

export interface Department {
  department_id: number;
  department_name: string;
  department_head_id: number;
  created_at?: Date;
  updated_at?: Date;
}

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

export type ProjectCluster = "Stone" | "Ballast" | "Sand" | "Water";

export interface Project {
  project_id: number;
  project_name: string;
  client_id: number;
  client_name?: string;
  start_date: string;
  end_date: string | null;
  cluster: ProjectCluster;
  created_at: string;
  updated_at: string;
}

// Client types
export type ClientSector =
  | "Non-profit"
  | "Individual"
  | "Startup"
  | "Government";
export type ClientCategory = "Converted" | "Prospect";

export interface Client {
  client_id: number;
  client_name: string;
  sector: ClientSector;
  category: ClientCategory;
  account_manager_id: number;
  entry_date: Date;
  created_at?: Date;
  updated_at?: Date;
}

// Timesheet-related types
export type TaskStation = "Office" | "Field" | "Remote";

export interface Timesheet {
  timesheet_id: number;
  staff_id: number;
  staff_name?: string;
  task_description: string;
  task_type: TaskType;
  task_station: TaskStation;
  department_id: number;
  department_name?: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  hours_spent: number;
  client_id: number | null;
  client_name?: string;
  project_id: number | null;
  project_name?: string;
  created_at: string;
  updated_at: string;
}

export interface TimesheetCreateData {
  staff_id: number;
  task_type: TaskType;
  task_station: TaskStation;
  department_id: number;
  client_id: number;
  project_id: number;
  task_description: string;
  date: string; // Format: YYYY-MM-DD
  check_in_time: string; // Format: HH:mm
  check_out_time: string; // Format: HH:mm
}
