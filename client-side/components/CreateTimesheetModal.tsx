/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
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
  STRATEGIC_PILLARS,
  StrategicPillar,
  TASK_OPTIONS,
  TaskStation,
  TaskType,
} from "@/types/types";
import { useClientProjects, useFetchClients } from "@/hooks/useClients";
import { useDepartments } from "@/hooks/useDepartments";
import { useCreateTimesheet } from "@/hooks/useTimesheets";
import AppModal from "@/components/common/Modal";

// ─── Props ────────────────────────────────────────────────────────────────────

interface CreateTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CreateTimesheetModal({
  isOpen,
  onClose,
}: CreateTimesheetModalProps) {
  // ── Form state ─────────────────────────────────────────────────────────────
  const [task, setTask] = React.useState<TaskType | "">("");
  const [taskStation, setTaskStation] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState<number | null>(null);
  const [client, setClient] = React.useState<string>("");
  const [clientId, setClientId] = React.useState<number | null>(null);
  const [project, setProject] = React.useState<string>("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskDate, setTaskDate] = React.useState<Dayjs | null>(null);
  const [startTime, setStartTime] = React.useState<Dayjs | null>(dayjs("2022-04-17T09:00"));
  const [endTime, setEndTime] = React.useState<Dayjs | null>(dayjs("2022-04-17T17:00"));
  const [totalMinutes, setTotalMinutes] = React.useState<number | null>(null);
  const [strategicPillar, setStrategicPillar] = React.useState<StrategicPillar | "">("");

  // ── UI state ───────────────────────────────────────────────────────────────
  const [cleared, setCleared] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // ── Data hooks ─────────────────────────────────────────────────────────────
  const { clients, loading: clientsLoading } = useFetchClients();
  const { projects: clientProjects } = useClientProjects(clientId);
  const { departments } = useDepartments();
  const { submit: submitTimesheet } = useCreateTimesheet();

  const clientNames = React.useMemo(() => clients?.map((c: ClientOption) => c.client_name), [clients]);
  const clientProjectNames = React.useMemo(() => clientProjects.map((c) => c.project_name), [clientProjects]);
  const departmentNames = React.useMemo(() => departments.map((c) => c.department_name), [departments]);

  React.useEffect(() => { setProject(""); }, [clientId]);

  React.useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => setCleared(false), 1500);
      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [cleared]);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const calculateTotalMinutes = (start: Dayjs | null, end: Dayjs | null): number | null => {
    if (!start || !end) return null;
    const diff = end.diff(start, "minute");
    return diff > 0 ? diff : null;
  };

  const resetForm = () => {
    setTask("");
    setTaskStation("");
    setDepartment("");
    setDepartmentId(null);
    setClient("");
    setClientId(null);
    setProject("");
    setTaskDescription("");
    setTaskDate(null);
    setStartTime(dayjs("2022-04-17T09:00"));
    setEndTime(dayjs("2022-04-17T17:00"));
    setSubmitSuccess(false);
    setSubmitError(null);
    setStrategicPillar("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  const validateForm = () => {
    if (!task || !taskStation || !department || !client || !project) {
      setSubmitError("Please fill in all required fields");
      return false;
    }
    if (!taskDescription.trim()) {
      setSubmitError("Please enter a task description");
      return false;
    }
    if (!taskDate) {
      setSubmitError("Please select a task date");
      return false;
    }
    return true;
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleTaskChange = (event: SelectChangeEvent<TaskType>) => setTask(event.target.value as TaskType);
  const handleTaskStationChange = (event: SelectChangeEvent) => setTaskStation(event.target.value);

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    const name = event.target.value;
    setDepartment(name);
    setDepartmentId(departments.find((d) => d.department_name === name)?.department_id ?? null);
  };

  const handleClientChange = (event: SelectChangeEvent) => {
    const name = event.target.value;
    setClient(name);
    setClientId(clients.find((c: ClientOption) => c.client_name === name)?.client_id ?? null);
    setProject("");
  };

  const handleProjectChange = (event: SelectChangeEvent) => setProject(event.target.value);

  const handleStartTimeChange = (value: Dayjs | null) => {
    setStartTime(value);
    setTotalMinutes(calculateTotalMinutes(value, endTime));
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    setEndTime(value);
    setTotalMinutes(calculateTotalMinutes(startTime, value));
  };

  const handleStrategicPillarChange = (event: SelectChangeEvent) => setStrategicPillar(event.target.value);

  const handleSubmit = async () => {
    setSubmitError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const selectedClient = clients.find((c: ClientOption) => c.client_name === client);
      const selectedProject = clientProjects.find((p) => p.project_name === project);
      const selectedDepartment = departments.find((d) => d.department_name === department);

      const timesheetData = {
        staff_id: 9,
        task_type: task,
        task_station: (taskStation.charAt(0).toUpperCase() + taskStation.slice(1).toLowerCase()) as TaskStation,
        department_id: selectedDepartment?.department_id || departmentId!,
        client_id: selectedClient?.client_id || clientId!,
        project_id: selectedProject?.project_id!,
        task_description: taskDescription,
        date: taskDate?.format("YYYY-MM-DD")!,
        check_in_time: startTime?.format("HH:mm:ss")!,
        check_out_time: endTime?.format("HH:mm:ss")!,
      };

      await submitTimesheet(timesheetData);
      setSubmitSuccess(true);
      setTimeout(() => handleClose(), 2000);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to create timesheet. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Footer buttons passed into the reusable modal ─────────────────────────
  const footer = (
    <>
      <Button
        onClick={handleClose}
        variant="outlined"
        size="large"
        disabled={isSubmitting}
        sx={{
          width: "150px",
          borderColor: "#f87171",
          color: "#ffffff",
          backgroundColor: "#D32F2F",
        }}
      >
        Cancel
      </Button>
      <Button
        onClick={handleSubmit}
        size="large"
        variant="contained"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={20} sx={{ color: "white" }} /> : null}
        sx={{ width: "250px", backgroundColor: "#15803d" }}
      >
        {isSubmitting ? "Creating..." : "Create Task"}
      </Button>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <AppModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Task"
      footer={footer}
    >
      <div className="flex flex-col gap-6">
        {/* Success / Error banners */}
        {submitSuccess && (
          <Alert severity="success">Task created successfully!</Alert>
        )}
        {submitError && (
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        )}

        {/* Row 1: Task type, Task station, Department */}
        <div className="flex space-x-2">
          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
              Type of Task <span className="text-brand-500">*</span>
            </label>
            <FormControl required sx={{ m: 1, minWidth: 280 }}>
              <InputLabel id="task-label">Type of task</InputLabel>
              <Select labelId="task-label" value={task} label="Type of task *" onChange={handleTaskChange} disabled={isSubmitting}>
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
              <InputLabel id="task-station-label">Task Station</InputLabel>
              <Select labelId="task-station-label" value={taskStation} label="Task-station *" onChange={handleTaskStationChange} disabled={isSubmitting}>
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
            <FormControl required sx={{ m: 1, minWidth: 280, maxWidth: 280 }}>
              <InputLabel id="department-label">Department</InputLabel>
              <Select labelId="department-label" value={department} label="Department *" onChange={handleDepartmentChange} disabled={isSubmitting}>
                {departmentNames.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
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
            rows={10}
            placeholder="Enter detailed task description..."
            sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}
            required
            value={taskDescription}
            onChange={(e) => setTaskDescription(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        {/* Row 3: Date and Time */}
        <div className="flex space-x-4 px-2 w-full">
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Box sx={{ flex: 1, position: "relative" }}>
              <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                Date <span className="text-brand-500">*</span>
              </label>
              <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">Task Date</label>
              <DesktopDatePicker
                value={taskDate}
                onChange={(val) => setTaskDate(val)}
                slotProps={{ field: { clearable: true, onClear: () => setCleared(true) } }}
                sx={{ width: "100%" }}
                disabled={isSubmitting}
              />
              {cleared && (
                <Alert sx={{ position: "absolute", bottom: 0, right: 0 }} severity="success">
                  Field cleared!
                </Alert>
              )}
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
                  <p className="block text-sm font-medium bg-green-300 text-gray-600 ml-2 mt-2">
                    {totalMinutes !== null ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : ""}
                  </p>
                </Box>
              </Box>
            </Box>
          </LocalizationProvider>
        </div>

        {/* Row 4: Client and Project */}
        <div className={`space-x-4 grid ${client === "Mediaforce Communications (MFC)" ? "grid-cols-3" : "grid-cols-2"}`}>
          <div>
            <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
              Client <span className="text-brand-500">*</span>
            </label>
            <FormControl required sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}>
              <InputLabel id="client-label">Client</InputLabel>
              <Select labelId="client-label" value={client} label="Client *" onChange={handleClientChange} disabled={isSubmitting || clientsLoading}>
                {clientsLoading ? (
                  <MenuItem disabled><CircularProgress size={20} sx={{ mr: 1 }} />Loading clients...</MenuItem>
                ) : clientNames?.length === 0 ? (
                  <MenuItem disabled>No clients available</MenuItem>
                ) : (
                  clientNames?.map((clientName) => (
                    <MenuItem key={clientName} value={clientName} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <em>{clientName}</em>
                    </MenuItem>
                  ))
                )}
              </Select>
              <FormHelperText>Required</FormHelperText>
            </FormControl>
          </div>

          {client === "Mediaforce Communications (MFC)" ? (
            <>
              <div>
                <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">Strategic Pillar</label>
                <FormControl required sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}>
                  <InputLabel id="strategic-pillar-label">Strategic Pillar</InputLabel>
                  <Select
                    labelId="strategic-pillar-label"
                    value={strategicPillar}
                    label="Strategic pillar"
                    onChange={handleStrategicPillarChange}
                    disabled={isSubmitting}
                    renderValue={(selected) => (
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selected.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                      </span>
                    )}
                  >
                    {STRATEGIC_PILLARS.map((pillar) => (
                      <MenuItem key={pillar} value={pillar} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {pillar.split(" ").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")}
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Required</FormHelperText>
                </FormControl>
              </div>

              <div>
                <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">Strategies & Key Activities</label>
                <FormControl required sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}>
                  <InputLabel id="project-label">Project</InputLabel>
                  <Select
                    labelId="project-label"
                    value={project}
                    label="Project *"
                    onChange={handleProjectChange}
                    disabled={isSubmitting}
                    renderValue={(selected) => (
                      <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected}</span>
                    )}
                  >
                    {clientProjectNames.map((p) => (
                      <MenuItem key={p} value={p} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>Required</FormHelperText>
                </FormControl>
              </div>
            </>
          ) : (
            <div>
              <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                Project <span className="text-brand-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}>
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  value={project}
                  label="Project *"
                  onChange={handleProjectChange}
                  disabled={isSubmitting}
                  renderValue={(selected) => (
                    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selected}</span>
                  )}
                >
                  {clientProjectNames.map((p) => (
                    <MenuItem key={p} value={p} sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</MenuItem>
                  ))}
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>
          )}
        </div>
      </div>
    </AppModal>
  );
}