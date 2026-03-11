
"use client";

import * as React from "react";
import Button from "@mui/material/Button";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Alert from "@mui/material/Alert";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import dayjs, { Dayjs } from "dayjs";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import {
  ClientOption,
  TASK_OPTIONS,
  TaskStation,
  TaskType,
} from "@/types/types";
import { useClientProjects, useFetchClients } from "@/hooks/useClients";
import { useDepartments } from "@/hooks/useDepartments";
import { useUpdateTimesheet } from "@/hooks/useTimesheets";
import { TimesheetRow } from "@/types/timesheets.types";
import AppModal from "@/components/common/Modal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface EditTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** The timesheet to edit — form is pre-populated from this */
  timesheet: TimesheetRow | null;
  /** Called after a successful save so the parent can refetch */
  onSuccess?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse "HH:mm:ss" into a dayjs object on an arbitrary base date */
function timeStringToDayjs(timeStr: string | null | undefined): Dayjs {
  if (!timeStr) return dayjs("2022-04-17T09:00");
  const [h, m] = timeStr.split(":");
  return dayjs(`2022-04-17T${h}:${m}`);
}

function calculateTotalMinutes(start: Dayjs | null, end: Dayjs | null): number | null {
  if (!start || !end) return null;
  const diff = end.diff(start, "minute");
  return diff > 0 ? diff : null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EditTimesheetModal({
  isOpen,
  onClose,
  timesheet,
  onSuccess,
}: EditTimesheetModalProps) {
  // ── Form state — initialised from the timesheet prop ──────────────────────
  const [task, setTask] = React.useState<TaskType | "">("");
  const [taskStation, setTaskStation] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState<number | null>(null);
  const [client, setClient] = React.useState("");
  const [clientId, setClientId] = React.useState<number | null>(null);
  const [project, setProject] = React.useState("");
  const [projectId, setProjectId] = React.useState<number | null>(null);
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskDate, setTaskDate] = React.useState<Dayjs | null>(null);
  const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs("2022-04-17T09:00"));
  const [endTime, setEndTime] = React.useState<Dayjs | null>(dayjs("2022-04-17T17:00"));
  const [totalMinutes, setTotalMinutes] = React.useState<number | null>(null);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // ── Data hooks ─────────────────────────────────────────────────────────────
  const { clients, loading: clientsLoading } = useFetchClients();
  const { projects: clientProjects } = useClientProjects(clientId);
  const { departments } = useDepartments();
  const { submit: submitUpdate } = useUpdateTimesheet();

  const clientNames = React.useMemo(() => clients?.map((c: ClientOption) => c.client_name), [clients]);
  const clientProjectNames = React.useMemo(() => clientProjects.map((p) => p.project_name), [clientProjects]);
  const departmentNames = React.useMemo(() => departments.map((d) => d.department_name), [departments]);

  // ── Populate form whenever the timesheet prop changes (i.e. modal opens) ──
  React.useEffect(() => {
    if (!timesheet) return;

    setTask(timesheet.task_type as TaskType);
    setTaskStation(timesheet.task_station.toLowerCase());
    setDepartment(timesheet.department_name);
    setDepartmentId(timesheet.department_id);
    setClient(timesheet.client_name ?? "");
    setClientId(timesheet.client_id);
    setProject(timesheet.project_name ?? "");
    setProjectId(timesheet.project_id);
    setTaskDescription(timesheet.task_description);
    setTaskDate(dayjs(timesheet.date));
    const start = timeStringToDayjs(timesheet.check_in_time);
    const end = timeStringToDayjs(timesheet.check_out_time);
    setStartTime(start);
    setEndTime(end);
    setTotalMinutes(calculateTotalMinutes(start, end));
    setSubmitSuccess(false);
    setSubmitError(null);
  }, [timesheet]);

  // ── Keep projectId in sync when project name is selected from the dropdown ─
  React.useEffect(() => {
    if (!project) return;
    const found = clientProjects.find((p) => p.project_name === project);
    if (found) setProjectId(found.project_id);
  }, [project, clientProjects]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleDepartmentChange = (e: SelectChangeEvent) => {
    const name = e.target.value;
    setDepartment(name);
    setDepartmentId(departments.find((d) => d.department_name === name)?.department_id ?? null);
  };

  const handleClientChange = (e: SelectChangeEvent) => {
    const name = e.target.value;
    setClient(name);
    setClientId(clients.find((c: ClientOption) => c.client_name === name)?.client_id ?? null);
    setProject("");
    setProjectId(null);
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    setStartTime(value);
    setTotalMinutes(calculateTotalMinutes(value, endTime));
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    setEndTime(value);
    setTotalMinutes(calculateTotalMinutes(startTime, value));
  };

  const handleClose = () => {
    onClose();
    setSubmitSuccess(false);
    setSubmitError(null);
  };

  const validateForm = (): boolean => {
    if (!task || !taskStation || !department || !taskDescription.trim()) {
      setSubmitError("Please fill in all required fields");
      return false;
    }
    if (!taskDate) {
      setSubmitError("Please select a task date");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!timesheet || !validateForm()) return;
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const payload = {
        task_type: task as TaskType,
        task_station: (taskStation.charAt(0).toUpperCase() + taskStation.slice(1).toLowerCase()) as TaskStation,
        department_id: departmentId ?? timesheet.department_id,
        client_id: clientId ?? timesheet.client_id ?? undefined,
        project_id: projectId ?? timesheet.project_id ?? undefined,
        task_description: taskDescription,
        date: taskDate!.format("YYYY-MM-DD"),
        check_in_time: startTime!.format("HH:mm:ss"),
        check_out_time: endTime!.format("HH:mm:ss"),
      };

      await submitUpdate(timesheet.timesheet_id, payload);
      setSubmitSuccess(true);
      onSuccess?.();
      setTimeout(() => handleClose(), 1500);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to update timesheet. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Footer ─────────────────────────────────────────────────────────────────
  const footer = (
    <>
      <Button
        onClick={handleClose}
        variant="outlined"
        size="large"
        disabled={isSubmitting}
        sx={{ width: "150px", borderColor: "#f87171", color: "#ffffff", backgroundColor: "#D32F2F" }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        size="large"
        variant="contained"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
        sx={{ width: "220px", backgroundColor: "#15803d" }}
      >
        {isSubmitting ? "Saving..." : "Save Changes"}
      </Button>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppModal isOpen={isOpen} onClose={handleClose} title="Edit Timesheet" footer={footer}>
      <div className="flex flex-col gap-6 min-w-200">
        {/* Banners */}
        {submitSuccess && <Alert severity="success">Timesheet updated successfully!</Alert>}
        {submitError && <Alert severity="error" onClose={() => setSubmitError(null)}>{submitError}</Alert>}

        {/* Row 1: Task type, Station, Department */}
         <div className="flex space-x-2">
          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
              Type of Task <span className="text-brand-500">*</span>
            </label>
            <FormControl required sx={{ m: 1, minWidth: 280 }}>
              <InputLabel id="edit-task-label">Type of task</InputLabel>
              <Select
                labelId="edit-task-label"
                value={task}
                label="Type of task *"
                onChange={(e) => setTask(e.target.value as TaskType)}
                disabled={isSubmitting}
              >
                {TASK_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
          </div>

          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
              Task Station <span className="text-brand-500">*</span>
            </label>
            <FormControl required sx={{ m: 1, minWidth: 280 }}>
              <InputLabel id="edit-station-label">Task Station</InputLabel>
              <Select
                labelId="edit-station-label"
                value={taskStation}
                label="Task Station *"
                onChange={(e) => setTaskStation(e.target.value)}
                disabled={isSubmitting}
              >
                <MenuItem value="office">Office</MenuItem>
                <MenuItem value="field">Field</MenuItem>
                <MenuItem value="remote">Remote</MenuItem>
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
          </div>

          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
              Department <span className="text-brand-500">*</span>
            </label>
            <FormControl required sx={{ m: 1, minWidth: 280 }}>
              <InputLabel id="edit-dept-label">Department</InputLabel>
              <Select
                labelId="edit-dept-label"
                value={department}
                label="Department *"
                onChange={handleDepartmentChange}
                disabled={isSubmitting}
              >
                {departmentNames.map((name) => (
                  <MenuItem key={name} value={name}>
                    {name.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
          </div>
        </div>

        {/* Row 2: Description */}
        <div>
          <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
            Task Description <span className="text-brand-500">*</span>
          </label>
          <TextField
            label="Task Description"
            multiline
            rows={6}
            placeholder="Enter detailed task description..."
            sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}
            required
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Row 3: Date and Time */}
        <div className="flex gap-4 px-2 w-full">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
             <Box sx={{ flex: 1, position: "relative" }}>
              <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                Date <span className="text-brand-500">*</span>
              </label>
              <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">Task Date</label>
              <DesktopDatePicker
                value={taskDate}
                onChange={(val) => setTaskDate(val)}
                sx={{ width: "100%" }}
                disabled={isSubmitting}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                Time Range <span className="text-brand-500">*</span>
              </label>
              <Box sx={{ display: "flex", gap: "1rem" }}>
                <Box sx={{ flex: 1 }}>
                  <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">Start Time</label>
                  <MobileTimePicker value={startTime} onChange={handleStartTimeChange} sx={{ width: "100%" }} disabled={isSubmitting} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">End Time</label>
                  <MobileTimePicker value={endTime} onChange={handleEndTimeChange} sx={{ width: "100%" }} disabled={isSubmitting} />
                  {totalMinutes !== null && (
                    <p className="text-sm font-medium bg-green-300 text-gray-600 ml-2 mt-2 px-2 rounded">
                      {Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m
                    </p>
                  )}
                </Box>
              </Box>
            </Box>
          </LocalizationProvider>
        </div>

        {/* Row 4: Client and Project */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">Client</label>
            <FormControl sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}>
              <InputLabel id="edit-client-label">Client</InputLabel>
              <Select
                labelId="edit-client-label"
                value={client}
                label="Client"
                onChange={handleClientChange}
                disabled={isSubmitting || clientsLoading}
              >
                {clientsLoading ? (
                  <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }} />Loading...</MenuItem>
                ) : (
                  clientNames?.map((name) => (
                    <MenuItem key={name} value={name} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <em>{name}</em>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>

          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">Project</label>
            <FormControl sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}>
              <InputLabel id="edit-project-label">Project</InputLabel>
              <Select
                labelId="edit-project-label"
                value={project}
                label="Project"
                onChange={(e) => setProject(e.target.value)}
                disabled={isSubmitting || !clientId}
                renderValue={(selected) => (
                  <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {selected}
                  </span>
                )}
              >
                {clientProjectNames.length === 0 ? (
                  <MenuItem disabled>
                    {clientId ? "No projects for this client" : "Select a client first"}
                  </MenuItem>
                ) : (
                  clientProjectNames.map((name) => (
                    <MenuItem key={name} value={name} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </div>
        </div>
      </div>
    </AppModal>
  );
}