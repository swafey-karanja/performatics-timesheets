"use client";

import React, { useState } from "react";
import { X } from "lucide-react";
import DatePicker from "./formComponents/datePicker";
import TimeFieldComponent from "./formComponents/timeField";
import SelectField from "./formComponents/selectField";
import ReusableSelect from "./formComponents/selectField";
import { SelectChangeEvent } from "@mui/material/Select";
import ReusableTextField from "./formComponents/textField";

// Types and Interfaces
interface FormData {
  taskDate: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
  taskName: string;
  taskType: TaskType;
  taskStation: TaskStation;
  individualKPI: string;
  role: string;
  programObjectives: string;
  project: string;
  completionStatus: CompletionStatus;
  keyResults: string;
}

type TaskType = "Advertisement" | "Meeting" | "Research" | "Other";
type TaskStation = "Office" | "Remote" | "Field";
type CompletionStatus = "" | "Complete" | "In Progress" | "Pending";

interface AddTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal Component
export const TimesheetModal: React.FC<AddTimesheetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState<FormData>({
    taskDate: "",
    startHour: "",
    startMinute: "",
    endHour: "",
    endMinute: "",
    taskName: "",
    taskType: "Advertisement",
    taskStation: "Office",
    individualKPI: "",
    role: "",
    programObjectives:
      "RS 1. To be the only institution that has an up-to date data for",
    project: "ACRC- The city manager & SDI Kenya Action Research & LVCT",
    completionStatus: "",
    keyResults: "",
  });

  const [taskStation, setTaskStation] = useState("");
  const [typeOfTask, setTypeOfStation] = useState("");
  const [taskCompletionStatus, setTaskCompletionStatus] = useState("");
  const [project, setProject] = useState("");
  const [individualKpi, setIndividualKpi] = useState("");
  const [programObjectives, setProgramObjectives] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    onClose();
  };

  const handleInputChange = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ): void => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleChange = (e: SelectChangeEvent) => {
    setTaskStation(e.target.value);
    setTypeOfStation(e.target.value);
    setTaskCompletionStatus(e.target.value);
    setProject(e.target.value);
    setIndividualKpi(e.target.value);
    setProgramObjectives(e.target.value);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 bg-opacity-50 backdrop-blur-sm transition-all duration-300 flex items-center justify-center px-2 sm:px-4 py-6 ">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-red-600 text-black p-4 flex justify-between items-center">
          <h2 className="text-2xl text-white font-semibold">
            Add Timesheet Entry
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {/* Task Date and Time Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label
                htmlFor="date"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Date <span className="text-red-500">*</span>
              </label>
              <DatePicker />
            </div>

            <div>
              <label
                htmlFor="start-time"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Start Time <span className="text-red-500">*</span>
              </label>
              <TimeFieldComponent label="Start time" />
            </div>

            <div>
              <label
                htmlFor="end-time"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                End Time <span className="text-red-500">*</span>
              </label>
              <TimeFieldComponent label="End time" />
            </div>
          </div>

          {/* Name of the Task */}
          <div className="mb-6">
            <label
              htmlFor="name-of-task"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Name of Task <span className="text-red-500">*</span>
            </label>
            <ReusableTextField label="Name of Task" width="100%" />
          </div>

          {/* Type of task and Task Station */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="task-station"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Task Station <span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Task Station"
                value={taskStation}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  { label: "Office", value: "Office" },
                  { label: "Remote", value: "Remote" },
                  { label: "Field", value: "Field" },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="task-station"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Type of Task <span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Type of task"
                value={typeOfTask}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  { label: "Office", value: "Office" },
                  { label: "Remote", value: "Remote" },
                  { label: "Field", value: "Field" },
                ]}
              />
            </div>
          </div>

          {/* Individual KPI and Role */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="individual-kpis"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Individual KPIs<span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Individual KPIs"
                value={individualKpi}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  {
                    label: "- Fill Out Other Fields -",
                    value: "- Fill Out Other Fields -",
                  },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="role"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Role (Where Applicable)
              </label>
              <ReusableTextField
                label="Role"
                width="100%"
                multiline
                maxRows={1}
              />
            </div>
          </div>

          {/* Program Objectives and Project */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="individual-kpis"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Program Objectives<span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Program Objectives"
                value={programObjectives}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  {
                    label:
                      "RS 1. To be the only institution that has an up-to date data",
                    value:
                      "RS 1. To be the only institution that has an up-to date data",
                  },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="project"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Project<span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Project"
                value={project}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  {
                    label:
                      "ACRC- The city manager & SDI Kenya Action Research & LVCT",
                    value:
                      "ACRC- The city manager & SDI Kenya Action Research & LVCT",
                  },
                ]}
              />
            </div>
          </div>

          {/* Task completion status and Key Results */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="task-completion-status"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Task Completion Status <span className="text-red-500">*</span>
              </label>
              <ReusableSelect
                label="Task Completion Status"
                value={taskCompletionStatus}
                onChange={handleChange}
                options={[
                  { label: "None", value: "" },
                  { label: "Complete", value: "Complete" },
                  { label: "In Progress", value: "In Progress" },
                  { label: "Pending", value: "Pending" },
                ]}
              />
            </div>

            <div>
              <label
                htmlFor="key-results"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Key Results<span className="text-red-500">*</span>
              </label>
              <ReusableTextField
                label="Key Results"
                width="100%"
                minRows={5}
                multiline
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-green-700 text-white rounded hover:bg-green-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Add Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
