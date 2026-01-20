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
  DEPARTMENT_OPTIONS,
  FormPayload,
  ProjectType,
  TASK_OPTIONS,
  TaskType,
} from "@/types/types";
import { useClientProjects } from "@/hooks/useClientProjects";

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

interface Props {
  basePayload: FormPayload; // Now fully typed
  cookie: string;
}

export default function BasicModal({
  basePayload: propBasePayload,
  cookie: propCookie,
}: Props) {
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
  // const [client, setClient] = React.useState("");
  const [project, setProject] = React.useState<ProjectType | "">("");
  const [taskDescription, setTaskDescription] = React.useState("");
  const [taskDate, setTaskDate] = React.useState<Dayjs | null>(null);
  const [startTime, setStartTime] = React.useState<Dayjs | null>(
    dayjs("2022-04-17T09:00"),
  );
  const [endTime, setEndTime] = React.useState<Dayjs | null>(
    dayjs("2022-04-17T17:00"),
  );
  const [totalMinutes, setTotalMinutes] = React.useState<number | null>(null);

  // UI states
  const [cleared, setCleared] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  // Handlers
  const handleTaskChange = (event: SelectChangeEvent<TaskType>) => {
    setTask(event.target.value as TaskType);
  };

  const handleTaskStationChange = (event: SelectChangeEvent) => {
    setTaskStation(event.target.value);
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };

  // const handleClientChange = (event: SelectChangeEvent) => {
  //   setClient(event.target.value);
  // };

  const handleProjectChange = (event: SelectChangeEvent<ProjectType>) => {
    setProject(event.target.value as ProjectType);
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

  const calculateTotalMinutes = (
    start: Dayjs | null,
    end: Dayjs | null,
  ): number | null => {
    if (!start || !end) return null;

    const diff = end.diff(start, "minute");

    return diff > 0 ? diff : null;
  };

  const defaultCookie =
    "wordpress_sec_1a0d9858b63531bba71b0b67b48b921e=Samuel%20Mwangi%7C1769068622%7CMt9ZbevRo9yyKDwzQqOBORRSJbxKvsru4x2fNvyfpKa%7C9f1e21faf8de7170db7e01c5e9b6328e2efef5deb54701531f7d9be5145d9cc6; cf_clearance=3FEvMK1301wLfme.sq99nVfQJG9dFUrYMJQ.h4foOQw-1768895762-1.2.1.1-B4kchD7TKE0E.h.wOqbhzK7CmLhnCaYjq6oPMMYCdHXjZMTgNwRN6kdQST6vyX1CGH7Xpm7XRRLUUl_FL5PGN_NGpU5pRlEhHZQWw7fG38zgHjazh9TiHxVduNHXfxjv2QMx9u2TB_WkfK.MI_b3sMuJLZhhyRCWEZ2U3Iq.WaAeR18pCjlrokHdYbMKwqqlSijzw2IQEu_diGyI2uIT6KvjOWY0ZVYlUruFOGv1EQQ; wordpress_test_cookie=WP%20Cookie%20check; wordpress_logged_in_1a0d9858b63531bba71b0b67b48b921e=Samuel%20Mwangi%7C1769068622%7CMt9ZbevRo9yyKDwzQqOBORRSJbxKvsru4x2fNvyfpKa%7C342d6de93207f3c35329e29607604d8da7d188319454d8c435896f10b3eafb5c; wp-settings-time-48=1768896307";

  const defaultBasePayload: FormPayload = {
    "form-id": "52",
    "lead-id": null,
    "field-ids": ["14", "40", "69"],
    "gravityview-meta": false,
    "field-values": {
      "8": "",
      "9": ["", "", "am"],
      "11": ["", "", "am"],
      "14": "",
      "22": "",
      "38": "",
      "39": "",
      "40": "",
      "43": "0",
      "49": "",
      "55": "48",
      "56": "",
      "63": "Samuel Mwangi",
      "65": "",
      "67": "Board",
      "68": "iGaming Afrika",
      "69": "Sand",
      "71": "",
      "72": "",
    },
    "merge-tags": ["@{Hours:43}", "@{Cluster:69}", "@{Account Manager:40}"],
    "lmt-nonces": {
      "{Hours:43}": "aa1e1e4c2b",
      "{Cluster:69}": "c672e2ec74",
      "{Account Manager:40}": "4ace45977c",
    },
    "current-merge-tag-values": {
      "@{Hours:43}": "",
      "@{Cluster:69}": "Water",
      "@{Account Manager:40}": "",
    },
    security: "8be24b9c42",
    show_admin_fields_in_ajax: "",
  };

  // Use props if provided, otherwise use hardcoded values
  const cookie = defaultCookie;
  const basePayload = propBasePayload || defaultBasePayload;
  const client = "iGaming Afrika";

  const { projects, isLoading, error } = useClientProjects(
    client,
    basePayload,
    cookie,
  );

  console.log({ projects });

  const resetForm = () => {
    setTask("");
    setTaskStation("");
    setDepartment("");
    // setClient("");
    setProject("");
    setTaskDescription("");
    setTaskDate(null);
    setStartTime(dayjs("2022-04-17T09:00"));
    setEndTime(dayjs("2022-04-17T17:00"));
    setSubmitSuccess(false);
    setSubmitError(null);
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

    // Prepare the data to send to the backend
    const formData = {
      taskType: task,
      taskStation: taskStation,
      department: department,
      client: client,
      project: project,
      description: taskDescription,
      taskDate: taskDate?.format("YYYY-MM-DD"),
      startTime: startTime?.format("HH:mm"),
      endTime: endTime?.format("HH:mm"),
      createdAt: new Date().toISOString(),
    };

    console.log({ formData });

    // try {
    //   // Replace with your actual API endpoint
    //   const response = await fetch("/api/tasks", {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //       // Add authentication headers if needed
    //       // "Authorization": `Bearer ${yourAuthToken}`
    //     },
    //     body: JSON.stringify(formData),
    //   });

    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }

    //   const data = await response.json();
    //   console.log("Task created successfully:", data);

    //   // Show success message
    //   setSubmitSuccess(true);

    //   // Close modal and reset form after 2 seconds
    //   setTimeout(() => {
    //     handleClose();
    //   }, 2000);
    // } catch (error) {
    //   console.error("Error creating task:", error);
    //   setSubmitError(
    //     error instanceof Error
    //       ? error.message
    //       : "Failed to create task. Please try again."
    //   );
    // } finally {
    //   setIsSubmitting(false);
    // }
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
              <FormControl required sx={{ m: 1, minWidth: 280 }}>
                <InputLabel id="department-label">Department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  value={department}
                  label="Department *"
                  onChange={handleDepartmentChange}
                  disabled={isSubmitting}
                >
                  {DEPARTMENT_OPTIONS.map((option) => (
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
                sx={{ m: 1, minWidth: "100%" }}
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
          <div className="space-x-2 flex">
            <div className="w-[50%]">
              <label
                htmlFor="client"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Client <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: "100%" }}>
                <InputLabel id="client-label">Client</InputLabel>
                <Select
                  labelId="client-label"
                  id="client"
                  value={client}
                  label="Client *"
                  // onChange={handleClientChange}
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="john">John Doe</MenuItem>
                  <MenuItem value="jane">Jane Smith</MenuItem>
                  <MenuItem value="mike">Mike Johnson</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>

            <div className="w-[50%] px-4">
              <label
                htmlFor="project"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Project <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: "100%" }}>
                <InputLabel id="project-label">Project</InputLabel>
                <Select
                  labelId="project-label"
                  id="project"
                  value={project}
                  label="Project *"
                  onChange={handleProjectChange}
                  disabled={isSubmitting}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="engineering">Engineering</MenuItem>
                  <MenuItem value="sales">Sales</MenuItem>
                  <MenuItem value="operations">Operations</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>
          </div>

          {/* Action Buttons */}
          <Stack
            direction="row"
            spacing={2}
            className="flex justify-center"
            sx={{ mt: 2 }}
          >
            <Button
              onClick={handleClose}
              variant="outlined"
              size="large"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              color="primary"
              size="large"
              variant="contained"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={20} /> : null}
            >
              {isSubmitting ? "Creating..." : "Create Task"}
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
