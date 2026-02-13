/* eslint-disable @typescript-eslint/no-non-null-asserted-optional-chain */
"use client";

import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
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
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import {
  // Client,
  // DEPARTMENT_OPTIONS,
  STRATEGIC_PILLARS,
  StrategicPillar,
  TASK_OPTIONS,
  TaskStation,
  TaskType,
} from "@/types/types";
// import { useClientProjects } from "@/hooks/useClientProjects";
import { useClientProjects, useFetchClients } from "@/hooks/useClients";
import { useDepartments } from "@/hooks/useDepartments";
import { useCreateTimesheet } from "@/hooks/useTimesheets";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "auto",
  maxWidth: "95vw",
  maxHeight: "90vh",
  overflow: "auto",
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

export default function BasicModal() {
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    // Reset form on close
    resetForm();
  };

  // Form states
  const [task, setTask] = React.useState<TaskType | "">("");
  const [taskStation, setTaskStation] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [departmentId, setDepartmentId] = React.useState<number | null>(null);
  const [client, setClient] = React.useState<string>("");
  const [clientId, setClientId] = React.useState<number | null>(null);
  const [project, setProject] = React.useState<string>("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskDate, setTaskDate] = React.useState<Dayjs | null>(null);
  const [startTime, setStartTime] = React.useState<Dayjs | null>(
    dayjs("2022-04-17T09:00"),
  );
  const [endTime, setEndTime] = React.useState<Dayjs | null>(
    dayjs("2022-04-17T17:00"),
  );
  const [totalMinutes, setTotalMinutes] = React.useState<number | null>(null);
  const [strategicPillar, setStrategicPillar] = React.useState<
    StrategicPillar | ""
  >("");

  // UI states
  const [cleared, setCleared] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Fetch Hooks
  const {
    clients,
    isLoading: clientsLoading,
    error: clientsError,
    mutate: clientsMutate,
  } = useFetchClients();

  const {
    projects: clientProjects,
    isLoading: clientProjectLoading,
    error: clientProjectsError,
  } = useClientProjects(clientId);

  const { departments, isLoading, error } = useDepartments();
  const {
    submit: submitTimesheet,
    isLoading: isSubmittingTimesheet,
    error: timesheetError,
  } = useCreateTimesheet();

  // console.log({ departments });
  // console.log({ clientProjects });

  const clientNames = React.useMemo(() => {
    return clients.map((c) => c.client_name);
  }, [clients]);

  const clientProjectNames = React.useMemo(() => {
    return clientProjects.map((c) => c.project_name);
  }, [clientProjects]);

  const departmentNames = React.useMemo(() => {
    return departments.map((c) => c.department_name);
  }, [departments]);

  // ✅ ADD THIS: Reset project when client changes
  React.useEffect(() => {
    setProject(""); // Clear project selection when client changes
  }, [clientId]);

  // Handlers
  const handleTaskChange = (event: SelectChangeEvent<TaskType>) => {
    setTask(event.target.value as TaskType);
  };

  const handleTaskStationChange = (event: SelectChangeEvent) => {
    setTaskStation(event.target.value);
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    const selectedDepartmentName = event.target.value;
    setDepartment(selectedDepartmentName);

    // ✅ Find the department object and extract the ID
    const selectedDepartment = departments.find(
      (d) => d.department_name === selectedDepartmentName,
    );
    setDepartmentId(selectedDepartment?.department_id ?? null);
  };

  const handleClientChange = (event: SelectChangeEvent) => {
    const selectedClientName = event.target.value;
    setClient(selectedClientName);

    // ✅ Find the client object and extract the ID
    const selectedClient = clients.find(
      (c) => c.client_name === selectedClientName,
    );
    setClientId(selectedClient?.client_id ?? null);

    // ✅ Clear the project when client changes
    setProject("");
  };
  const handleProjectChange = (event: SelectChangeEvent) => {
    setProject(event.target.value);
  };

  const handleTaskDescriptionChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setTaskDescription(event.target.value);
  };

  const handleTaskDateChange = (newValue: Dayjs | null) => {
    setTaskDate(newValue);
  };

  const handleStartTimeChange = (value: Dayjs | null) => {
    setStartTime(value);

    const total = calculateTotalMinutes(value, endTime);
    setTotalMinutes(total);
  };

  const handleEndTimeChange = (value: Dayjs | null) => {
    setEndTime(value);

    const total = calculateTotalMinutes(startTime, value);
    setTotalMinutes(total);
  };

  const handleStrategicPillarChange = (event: SelectChangeEvent) => {
    setStrategicPillar(event.target.value);
  };

  const calculateTotalMinutes = (
    start: Dayjs | null,
    end: Dayjs | null,
  ): number | null => {
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

  const handleSubmit = async () => {
    // Clear previous errors
    setSubmitError(null);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedClient = clients.find((c) => c.client_name === client);
      const selectedProject = clientProjects.find(
        (p) => p.project_name === project,
      );
      const selectedDepartment = departments.find(
        (d) => d.department_name === department,
      );

      // Prepare the data to send to the backend
      const timesheetData = {
        staff_id: 9,
        task_type: task,
        task_station: (taskStation.charAt(0).toUpperCase() +
          taskStation.slice(1).toLowerCase()) as TaskStation,
        department_id: selectedDepartment?.department_id || departmentId!,
        client_id: selectedClient?.client_id || clientId!,
        project_id: selectedProject?.project_id!,
        task_description: taskDescription,
        date: taskDate?.format("YYYY-MM-DD")!,
        check_in_time: startTime?.format("HH:mm:ss")!,
        check_out_time: endTime?.format("HH:mm:ss")!,
      };

      console.log({ timesheetData });

      // ✅ Submit to backend using the hook
      const result = await submitTimesheet(timesheetData);

      console.log("Timesheet created successfully:", result);

      // Show success message
      setSubmitSuccess(true);

      // Close modal and reset form after 2 seconds
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      console.error("Error creating timesheet:", error);
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Failed to create timesheet. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  React.useEffect(() => {
    if (cleared) {
      const timeout = setTimeout(() => {
        setCleared(false);
      }, 1500);

      return () => clearTimeout(timeout);
    }
    return () => {};
  }, [cleared]);

  return (
    <div>
      <Button onClick={handleOpen} variant="contained" size="large">
        Create New Task
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="flex flex-col gap-6">
          {/* Success/Error Messages */}
          {submitSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Task created successfully!
            </Alert>
          )}
          {submitError && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => setSubmitError(null)}
            >
              {submitError}
            </Alert>
          )}

          {/* Row 1: Category, Task Station, Department */}
          <div className="space-x-2 flex ">
            <div>
              <label
                htmlFor="task"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Type of Task <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: 280 }}>
                <InputLabel id="task-label">Type of task</InputLabel>
                <Select
                  labelId="task-label"
                  id="task"
                  value={task}
                  label="Type of task *"
                  onChange={handleTaskChange}
                  disabled={isSubmitting}
                >
                  {TASK_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option
                        .split(" ")
                        .map((word) => word[0].toUpperCase() + word.slice(1))
                        .join(" ")}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>

            <div>
              <label
                htmlFor="task-station"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Task Station <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: 280 }}>
                <InputLabel id="task-station-label">Task Station</InputLabel>
                <Select
                  labelId="task-station-label"
                  id="task-station"
                  value={taskStation}
                  label="Task-station *"
                  onChange={handleTaskStationChange}
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
              <label
                htmlFor="department"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Department <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: 280, maxWidth: 280 }}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  value={department}
                  label="Department *"
                  onChange={handleDepartmentChange}
                  disabled={isSubmitting}
                >
                  {departmentNames.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option
                        .split(" ")
                        .map((word) => word[0].toUpperCase() + word.slice(1))
                        .join(" ")}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>
          </div>

          {/* Row 2: Description */}
          <div className="space-x-2">
            <div>
              <label
                htmlFor="task-description"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Task Description <span className="text-red-500">*</span>
              </label>
              <TextField
                id="task-description"
                label="Task Description"
                multiline
                rows={10}
                placeholder="Enter detailed task description..."
                sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}
                required
                value={taskDescription}
                onChange={handleTaskDescriptionChange}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Row 3: Date and Time Pickers */}
          <div className="flex space-x-4 px-2 w-full">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <Box sx={{ flex: 1, position: "relative" }}>
                <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">
                  Task Date
                </label>
                <DesktopDatePicker
                  value={taskDate}
                  onChange={handleTaskDateChange}
                  slotProps={{
                    field: {
                      clearable: true,
                      onClear: () => setCleared(true),
                    },
                  }}
                  sx={{ width: "100%" }}
                  disabled={isSubmitting}
                />
                {cleared && (
                  <Alert
                    sx={{ position: "absolute", bottom: 0, right: 0 }}
                    severity="success"
                  >
                    Field cleared!
                  </Alert>
                )}
              </Box>

              <Box sx={{ flex: 1 }}>
                <label className="block text-md font-semibold text-gray-700 ml-2 mb-1">
                  Time Range <span className="text-red-500">*</span>
                </label>
                <Box sx={{ display: "flex", gap: "1rem" }}>
                  <Box sx={{ flex: 1 }}>
                    <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">
                      Start Time
                    </label>
                    <MobileTimePicker
                      value={startTime}
                      onChange={handleStartTimeChange}
                      sx={{ width: "100%" }}
                      disabled={isSubmitting}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">
                      End Time
                    </label>
                    <MobileTimePicker
                      value={endTime}
                      onChange={handleEndTimeChange}
                      sx={{ width: "100%" }}
                      disabled={isSubmitting}
                    />
                    <p className="block text-sm font-medium bg-green-300 text-gray-600 ml-2 mt-2">
                      {totalMinutes !== null
                        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                        : ""}
                    </p>
                  </Box>
                </Box>
              </Box>
            </LocalizationProvider>
          </div>

          {/* Row 4: Client and Project */}
          <div
            className={`space-x-4 grid ${client === "Mediaforce Communications (MFC)" ? "grid-cols-3 " : "grid-cols-2"}`}
          >
            <div className="">
              <label
                htmlFor="client"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Client <span className="text-red-500">*</span>
              </label>
              <FormControl
                required
                sx={{ m: 1, minWidth: "100%", maxWidth: "100%" }}
              >
                <InputLabel id="client-label">Client</InputLabel>
                <Select
                  labelId="client-label"
                  id="client"
                  value={client}
                  label="Client *"
                  onChange={handleClientChange}
                  disabled={isSubmitting || clientsLoading} // ✅ Disable while loading
                >
                  {/* ✅ Show loading state */}
                  {clientsLoading ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading clients...
                    </MenuItem>
                  ) : clientsError ? (
                    <MenuItem disabled>Error loading clients</MenuItem>
                  ) : clientNames.length === 0 ? (
                    <MenuItem disabled>No clients available</MenuItem>
                  ) : (
                    clientNames.map((clientName) => (
                      <MenuItem
                        value={clientName}
                        key={clientName}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
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
                <div className="">
                  <label
                    htmlFor="strategic-pillar"
                    className="block text-md font-semibold text-gray-700 ml-2 mb-1"
                  >
                    Strategic Pillar
                  </label>
                  <FormControl
                    required
                    sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}
                  >
                    <InputLabel id="strategic-pillar-label">Project</InputLabel>

                    <Select
                      labelId="strategic-pillar-label"
                      id="strategic-pillar"
                      value={strategicPillar}
                      label="Strategic pillar"
                      onChange={handleStrategicPillarChange}
                      disabled={isSubmitting}
                      renderValue={(selected) => (
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected
                            .split(" ")
                            .map(
                              (word) => word[0].toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </span>
                      )}
                    >
                      {STRATEGIC_PILLARS.map((pillar) => (
                        <MenuItem
                          key={pillar}
                          value={pillar}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {pillar
                            .split(" ")
                            .map(
                              (word) => word[0].toUpperCase() + word.slice(1),
                            )
                            .join(" ")}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText>Required</FormHelperText>
                  </FormControl>
                </div>

                <div
                  className={`${client === "Mediaforce Communications (MFC)" ? "" : ""}`}
                >
                  <label
                    htmlFor="project"
                    className="block text-md font-semibold text-gray-700 ml-2 mb-1"
                  >
                    Strategies & Key Activities{" "}
                  </label>
                  <FormControl
                    required
                    sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}
                  >
                    <InputLabel id="project-label">Project</InputLabel>

                    <Select
                      labelId="project-label"
                      id="project"
                      value={project}
                      label="Project *"
                      onChange={handleProjectChange}
                      disabled={isSubmitting}
                      renderValue={(selected) => (
                        <span
                          style={{
                            display: "block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {selected}
                        </span>
                      )}
                    >
                      {clientProjectNames.map((project) => (
                        <MenuItem
                          key={project}
                          value={project}
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {project}
                        </MenuItem>
                      ))}
                    </Select>

                    <FormHelperText>Required</FormHelperText>
                  </FormControl>
                </div>
              </>
            ) : (
              <div className="">
                <label
                  htmlFor="project"
                  className="block text-md font-semibold text-gray-700 ml-2 mb-1"
                >
                  Project <span className="text-red-500">*</span>
                </label>
                <FormControl
                  required
                  sx={{ m: 1, maxWidth: "100%", minWidth: "100%" }}
                >
                  <InputLabel id="project-label">Project</InputLabel>

                  <Select
                    labelId="project-label"
                    id="project"
                    value={project}
                    label="Project *"
                    onChange={handleProjectChange}
                    disabled={isSubmitting}
                    renderValue={(selected) => (
                      <span
                        style={{
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {selected}
                      </span>
                    )}
                  >
                    {clientProjectNames.map((project) => (
                      <MenuItem
                        key={project}
                        value={project}
                        sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {project}
                      </MenuItem>
                    ))}
                  </Select>

                  <FormHelperText>Required</FormHelperText>
                </FormControl>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            className="flex justify-center"
            sx={{ mt: 2 }}
          >
            {/* Cancel Button with red border */}
            <Button
              onClick={handleClose}
              variant="outlined"
              size="large"
              disabled={isSubmitting}
              sx={{
                width: "150px",
                borderColor: "red",
                color: "white",
                backgroundColor: "red",
                "&:hover": {
                  color: "white",
                  borderColor: "darkred",
                  backgroundColor: "darkred", // subtle red hover effect
                },
              }}
            >
              Cancel
            </Button>

            {/* Submit Button with red background and matching spinner */}
            <Button
              onClick={handleSubmit}
              size="large"
              variant="contained"
              disabled={isSubmitting}
              startIcon={
                isSubmitting ? (
                  <CircularProgress size={20} sx={{ color: "white" }} />
                ) : null
              }
              sx={{
                width: "250px",
                backgroundColor: "green",
                "&:hover": { backgroundColor: "darkgreen" }, // slightly less dark than default
              }}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
