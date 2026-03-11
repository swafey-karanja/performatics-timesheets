"use client";
import React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from "recharts";

// ── Shared staff data (in a real app this would come from a shared context or API) ──
export const STAFF_DISTRIBUTION_DATA = [
  {
    id: 1,
    name: "Anselm Muchura",
    departments: [
      { department: "Video Production, Animation & Photography", headcount: 1 },
      { department: "Finance, HR, Procurement & Admin", headcount: 2 },
      { department: "Web & Digital Solutions", headcount: 3 },
      { department: "Business Development", headcount: 1 },
      { department: "Board", headcount: 1 },
    ],
    hoursComparison: [
      { name: "Anselm\nOdhiambo", workedHours: 0.2, contractedHours: 1.0 },
    ],
  },
  {
    id: 2,
    name: "Kaiya George",
    departments: [
      { department: "Web & Digital Solutions", headcount: 4 },
      { department: "Finance, HR, Procurement & Admin", headcount: 1 },
      { department: "Business Development", headcount: 2 },
    ],
    hoursComparison: [
      { name: "Kaiya\nGeorge", workedHours: 0.8, contractedHours: 1.0 },
    ],
  },
];

interface EmployeeDistributionProps {
  selectedStaffId: number | null;
}

const EmployeeDistribution = ({ selectedStaffId }: EmployeeDistributionProps) => {
  const staff =
    STAFF_DISTRIBUTION_DATA.find((s) => s.id === selectedStaffId) ??
    STAFF_DISTRIBUTION_DATA[0];

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6 h-full">
      {/* Title */}
      <h3 className="text-sm font-bold tracking-widest uppercase text-red-500 mb-4">
        Staff Distribution
      </h3>

      <div className="w-full border-t border-gray-100 dark:border-gray-700 mb-2" />

      {/* Department List */}
      <div className="flex flex-col divide-y divide-dashed divide-gray-200 dark:divide-gray-700 mb-6">
        {staff.departments.map((row, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-3 text-sm"
          >
            <span className="text-gray-700 dark:text-gray-300">
              {row.department}
            </span>
            <span className="text-gray-500 dark:text-gray-400 font-medium ml-4 shrink-0">
              {row.headcount}.
            </span>
          </div>
        ))}
      </div>

      {/* Bar Chart */}
      <div className="mt-4">
        <ResponsiveContainer width="100%" height={180}>
          <BarChart
            data={staff.hoursComparison}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 20, bottom: 0 }}
            barSize={8}
          >
            <CartesianGrid
              horizontal={false}
              strokeDasharray="3 3"
              stroke="#e5e7eb"
            />
            <XAxis
              type="number"
              domain={[0, 1]}
              ticks={[0.0, 0.5, 1.0]}
              tickLine={false}
              axisLine={{ stroke: "#9ca3af" }}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
            />
            <YAxis
              type="category"
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              width={60}
            />
            <Tooltip
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
              contentStyle={{
                fontSize: 11,
                borderRadius: 8,
                border: "1px solid #e5e7eb",
                color: "#374151",
              }}
            />
            <Bar dataKey="workedHours" fill="#3b82f6" radius={[0, 2, 2, 0]} />
            <Bar
              dataKey="contractedHours"
              fill="#ef4444"
              radius={[0, 2, 2, 0]}
            />
            <Legend
              iconType="square"
              iconSize={10}
              formatter={(value) =>
                value === "workedHours" ? "Worked hours" : "Contracted hours"
              }
              wrapperStyle={{ fontSize: 11, color: "#9ca3af", paddingTop: 8 }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmployeeDistribution;