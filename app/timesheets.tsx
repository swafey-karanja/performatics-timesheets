"use client"

import { useState } from "react";
import { TimesheetModal } from "./components/timesheetModal";


type TabId = 'myTimesheet' | 'addParticulars' | 'allTimesheets';
type TaskType = 'Advertisement' | 'Meeting' | 'Research' | 'Other';
type TaskStation = 'Office' | 'Remote' | 'Field';


interface TimesheetEntry {
  id: string;
  date: string;
  checkIn: string;
  checkOut: string;
  particulars: string;
  typeOfTask: TaskType;
  taskStation: TaskStation;
  programObjectives: string;
  project: string;
  keyResults: string;
}

interface Tab {
  id: TabId;
  label: string;
}

export const TimesheetsPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('myTimesheet');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const tabs: Tab[] = [
    { id: 'myTimesheet', label: 'My Timesheet' },
    { id: 'addParticulars', label: 'Add Particulars' },
    { id: 'allTimesheets', label: 'All Timesheets' }
  ];

  const handleTabClick = (tabId: TabId): void => {
    setActiveTab(tabId);
  };

  const handleOpenModal = (): void => {
    setIsModalOpen(true);
  };

  const handleCloseModal = (): void => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <div className="z-0">

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Staff Timesheet</h1>
          <button
            onClick={handleOpenModal}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            type="button"
          >
            Add Timesheet Data
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex gap-8 border-b">
            {tabs.map((tab: Tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={`pb-3 px-1 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-red-600'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-6">
        <div className="bg-white rounded-lg shadow">
          {/* Table Header */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                    <div className="flex items-center gap-2">
                      <span>↓</span>
                      Date
                    </div>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check in</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Check out</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Particulars</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Type of task</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Task Station</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Program Objectives</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Project</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Key Results</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center text-gray-500">
                    No data available in table
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 text-sm text-gray-600">
            Showing 0 to 0 of 0 entries
          </div>
        </div>
      </div>
        </div>

      {/* Modal */}
      <TimesheetModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </div>
  );
};