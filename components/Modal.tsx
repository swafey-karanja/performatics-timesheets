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
import dayjs from "dayjs";
import { MobileTimePicker } from "@mui/x-date-pickers/MobileTimePicker";
import Stack from "@mui/material/Stack";

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
  const handleClose = () => setOpen(false);
  const [task, setTask] = React.useState("");
  const [taskStation, setTaskStation] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [client, setClient] = React.useState("");
  const [project, setProject] = React.useState("");
  const [cleared, setCleared] = React.useState<boolean>(false);

  const handleTaskChange = (event: SelectChangeEvent) => {
    setTask(event.target.value);
  };

  const handleTaskStationChange = (event: SelectChangeEvent) => {
    setTaskStation(event.target.value);
  };

  const handleDepartmentChange = (event: SelectChangeEvent) => {
    setDepartment(event.target.value);
  };

  const handleClientChange = (event: SelectChangeEvent) => {
    setClient(event.target.value);
  };

  const handleProjectChange = (event: SelectChangeEvent) => {
    setProject(event.target.value);
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
          {/* Row 1: Category, Task Station, Status */}
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
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>

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
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="development">Development</MenuItem>
                  <MenuItem value="design">Design</MenuItem>
                  <MenuItem value="marketing">Marketing</MenuItem>
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
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="urgent">Urgent</MenuItem>
                </Select>
                <FormHelperText>Required</FormHelperText>
              </FormControl>
            </div>

            <div>
              <label
                htmlFor="department"
                className="block text-md font-semibold text-gray-700 ml-2 mb-1"
              >
                Department related to Task{" "}
                <span className="text-red-500">*</span>
              </label>
              <FormControl required sx={{ m: 1, minWidth: 280 }}>
                <InputLabel id="department-label">department</InputLabel>
                <Select
                  labelId="department-label"
                  id="department"
                  value={department}
                  label="Department *"
                  onChange={handleDepartmentChange}
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="todo">To Do</MenuItem>
                  <MenuItem value="in-progress">In Progress</MenuItem>
                  <MenuItem value="review">In Review</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
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
                  slotProps={{
                    field: {
                      clearable: true,
                      onClear: () => setCleared(true),
                    },
                  }}
                  sx={{ width: "100%" }}
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
                      defaultValue={dayjs("2022-04-17T09:00")}
                      sx={{ width: "100%" }}
                    />
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <label className="block text-xs font-medium text-gray-600 ml-2 mb-1">
                      End Time
                    </label>
                    <MobileTimePicker
                      defaultValue={dayjs("2022-04-17T17:00")}
                      sx={{ width: "100%" }}
                    />
                  </Box>
                </Box>
              </Box>
            </LocalizationProvider>
          </div>

          {/* Row 4: client and Project */}
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
                  onChange={handleClientChange}
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
            <Button onClick={handleClose} variant="outlined" size="large">
              Cancel
            </Button>
            <Button color="primary" size="large" variant="contained">
              Create Task
            </Button>
          </Stack>
        </Box>
      </Modal>
    </div>
  );
}
