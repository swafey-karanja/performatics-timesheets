export interface TimesheetRow {
  timesheet_id: number;
  staff_id: number;
  staff_name: string;
  task_description: string;
  task_type: string;
  task_station: "Office" | "Field" | "Remote";
  department_id: number;
  department_name: string;
  date: string;
  check_in_time: string;
  check_out_time: string;
  hours_spent: number | null;
  client_id: number | null;
  client_name: string | null;
  project_id: number | null;
  project_name: string | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedTimesheets {
  data: TimesheetRow[];
  pagination: PaginationMeta;
}

export interface TimesheetQueryParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
  search?: string;
  startDate?: string;
  endDate?: string;
  staffId?: number;
  departmentId?: number;
  clientId?: number;
  projectId?: number;
  taskStation?: "Office" | "Field" | "Remote";
  taskType?: string;
  minHours?: number;
  maxHours?: number;
}

export interface UseTimesheetsResult {
  data: TimesheetRow[];
  pagination: PaginationMeta | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}