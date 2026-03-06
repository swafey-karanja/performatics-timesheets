/**
 * Timesheet service — type definitions
 * Imports shared domain types from types.ts and extends them
 * with service-layer interfaces for queries, sorting, and responses.
 */

import { TaskStation, TaskType } from "../types/types";

// ─── Entity interfaces ────────────────────────────────────────────────────────

export interface TimesheetEntry {
  timesheet_id?: number;
  staff_id: number;
  task_description: string;
  task_type: TaskType;
  task_station: TaskStation;
  department_id: number;
  date: string;
  check_in_time: string;
  check_out_time: string;
  hours_spent?: number;
  client_id?: number;
  project_id?: number;
}

export interface TimesheetWithDetails extends TimesheetEntry {
  staff_name?: string;
  department_name?: string;
  client_name?: string;
  project_name?: string;
}

// ─── Query interfaces ─────────────────────────────────────────────────────────

export interface TimesheetFilters {
  startDate?: string;
  endDate?: string;
  staffId?: number;
  departmentId?: number;
  clientId?: number;
  projectId?: number;
  taskStation?: TaskStation;
  taskType?: TaskType;
  minHours?: number;
  maxHours?: number;
}

export interface TimesheetSortOptions {
  sortBy?: TimesheetSortField;
  sortOrder?: "ASC" | "DESC";
}

/**
 * Sortable columns exposed to API consumers.
 * Must map 1-to-1 with ALLOWED_SORT_FIELDS in timesheet.queries.ts.
 */
export type TimesheetSortField =
  | "date"
  | "check_in_time"
  | "check_out_time"
  | "hours_spent"
  | "staff_name"
  | "department_name"
  | "task_type"
  | "task_station";

export interface PaginationOptions {
  page?: number;
  limit?: number;
}

/** Combined options object consumed by service functions */
export interface TimesheetQueryOptions
  extends TimesheetFilters, TimesheetSortOptions, PaginationOptions {
  /** Full-text search across staff_name, task_description, task_type */
  search?: string;
}

// ─── Response interfaces ──────────────────────────────────────────────────────

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTimesheetResult {
  data: TimesheetWithDetails[];
  pagination: PaginationMeta;
}

export interface StaffHoursSummary {
  staff_name: string;
  total_hours: number;
  number_of_entries: number;
  first_entry_date: string;
  last_entry_date: string;
}

export interface ProjectHoursSummary {
  project_name: string;
  client_name: string;
  total_hours: number;
  staff_count: number;
  number_of_entries: number;
  first_entry_date: string;
  last_entry_date: string;
}
