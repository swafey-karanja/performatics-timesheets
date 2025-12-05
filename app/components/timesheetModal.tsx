"use client"

import React, { useState } from 'react';
import { X } from 'lucide-react';

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

type TaskType = 'Advertisement' | 'Meeting' | 'Research' | 'Other';
type TaskStation = 'Office' | 'Remote' | 'Field';
type CompletionStatus = '' | 'Complete' | 'In Progress' | 'Pending';

interface AddTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Modal Component
export const TimesheetModal: React.FC<AddTimesheetModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<FormData>({
    taskDate: '',
    startHour: '',
    startMinute: '',
    endHour: '',
    endMinute: '',
    taskName: '',
    taskType: 'Advertisement',
    taskStation: 'Office',
    individualKPI: '',
    role: '',
    programObjectives: 'RS 1. To be the only institution that has an up-to date data for',
    project: 'ACRC- The city manager & SDI Kenya Action Research & LVCT',
    completionStatus: '',
    keyResults: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onClose();
  };

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateTimeOptions = (max: number): string[] => {
    return Array.from({ length: max }, (_, i) => i.toString().padStart(2, '0'));
  };

  return (
    <div className="fixed inset-0 bg-black opacity-50 flex items-center justify-center z-30">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto m-4">
        <div className="sticky top-0 bg-red-600 text-black p-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Add Timesheet Entry</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200" type="button">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6">
          {/* Task Date and Time Row */}
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Task Date <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                placeholder="dd/mm/yyyy"
                value={formData.taskDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('taskDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Start Time <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <select 
                  value={formData.startHour}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('startHour', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">HH</option>
                  {generateTimeOptions(24).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <select 
                  value={formData.startMinute}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('startMinute', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">MM</option>
                  {generateTimeOptions(60).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                End Time <span className="text-red-600">*</span>
              </label>
              <div className="flex gap-2">
                <select 
                  value={formData.endHour}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('endHour', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">HH</option>
                  {generateTimeOptions(24).map((hour) => (
                    <option key={hour} value={hour}>
                      {hour}
                    </option>
                  ))}
                </select>
                <select 
                  value={formData.endMinute}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('endMinute', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">MM</option>
                  {generateTimeOptions(60).map((minute) => (
                    <option key={minute} value={minute}>
                      {minute}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-sm text-gray-600 mt-1">0 hours worked</p>
            </div>
          </div>

          {/* Name of the Task */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-black">
              Name of the Task <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={formData.taskName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('taskName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Type of task and Task Station */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Type of task <span className="text-red-600">*</span>
              </label>
              <select 
                value={formData.taskType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('taskType', e.target.value as TaskType)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Advertisement">Advertisement</option>
                <option value="Meeting">Meeting</option>
                <option value="Research">Research</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Task Station <span className="text-red-600">*</span>
              </label>
              <select 
                value={formData.taskStation}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('taskStation', e.target.value as TaskStation)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="Office">Office</option>
                <option value="Remote">Remote</option>
                <option value="Field">Field</option>
              </select>
            </div>
          </div>

          {/* Individual KPI and Role */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Individual KPI -
              </label>
              <select 
                value={formData.individualKPI}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('individualKPI', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">- Fill Out Other Fields -</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Role (Where applicable)
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('role', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Program Objectives and Project */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Program Objectives
              </label>
              <select 
                value={formData.programObjectives}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('programObjectives', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="RS 1. To be the only institution that has an up-to date data for">
                  RS 1. To be the only institution that has an up-to date data for
                </option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Project
              </label>
              <select 
                value={formData.project}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('project', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="ACRC- The city manager & SDI Kenya Action Research & LVCT">
                  ACRC- The city manager & SDI Kenya Action Research & LVCT
                </option>
              </select>
            </div>
          </div>

          {/* Task completion status and Key Results */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Task completion status <span className="text-red-600">*</span>
              </label>
              <select 
                value={formData.completionStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange('completionStatus', e.target.value as CompletionStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select status</option>
                <option value="Complete">Complete</option>
                <option value="In Progress">In Progress</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 text-black">
                Key Results <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={4}
                value={formData.keyResults}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('keyResults', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
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