/**
 * Type definitions for the timesheet application
 */

// Staff types
export type WorkType = "Employment" | "Consultancy" | "Internship";
export type Gender = "Male" | "Female";
export type AccountStatus = "Active" | "Suspended";

// Timesheet types
export type TaskStation = "Office" | "Field" | "Remote";
export type TaskType =
  | "Creative"
  | "Project management"
  | "Accounts & Finance"
  | "Client service"
  | "Admin"
  | "Admin meeting"
  | "Discovery meeting"
  | "Business development meeting"
  | "Project meeting"
  | "Procurement"
  | "HR"
  | "Proposal development"
  | "Report Review"
  | "Report writing"
  | "Presentation development";

// Client types
export type ClientSector =
  | "Non-profit"
  | "Individual"
  | "Startup"
  | "Government";
export type ClientCategory = "Converted" | "Prospect";

// Project types
export type ProjectCluster = "Stone" | "Ballast" | "Sand" | "Water";

/**
 * Database table interfaces
 */

export interface StaffDetails {
  staff_id: number;
  staff_name: string;
  work_type: WorkType;
  staff_role: string;
  gender?: Gender;
  personal_email: string;
  phone_number?: string;
  date_joined: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface StaffAccount {
  account_id: number;
  staff_id: number;
  username: string;
  work_email: string;
  status: AccountStatus;
  department_id?: number;
  date_registered: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface Department {
  department_id: number;
  department_name: string;
  department_head_id: number;
  created_at?: Date;
  updated_at?: Date;
}

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

export interface Project {
  project_id: number;
  project_name: string;
  client_id: number;
  start_date: Date;
  end_date?: Date;
  cluster: ProjectCluster;
  account_manager: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface Timesheet {
  timesheet_id: number;
  staff_id: number;
  task_description: string;
  task_type: TaskType;
  task_station: TaskStation;
  department_id: number;
  date: Date;
  check_in_time: string;
  check_out_time: string;
  hours_spent?: number;
  client_id?: number;
  project_id?: number;
  created_at?: Date;
  updated_at?: Date;
}

/**
 * API Response interfaces
 */

export interface ApiResponse<T = any> {
  status: "success" | "error";
  data?: T;
  message?: string;
  count?: number;
}

export interface ErrorResponse {
  status: "error";
  statusCode: number;
  message: string;
  errors?: Array<{
    field: string;
    message: string;
  }>;
  stack?: string;
}

/**
 * Query parameter interfaces
 */

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface TimesheetQueryParams extends PaginationParams {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  departmentId?: number;
  clientId?: number;
  projectId?: number;
}

export interface StaffQueryParams extends PaginationParams {
  workType?: WorkType;
  departmentId?: number;
  status?: AccountStatus;
}
