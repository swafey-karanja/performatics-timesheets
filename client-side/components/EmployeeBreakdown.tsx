"use client";

import React, { useState } from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts";
import Image from "next/image";
import EmployeeDistribution from "./EmployeeDistribution";

const STAFF = [
  {
    id: 1,
    name: "Anselm Muchura",
    image: "/user/owner.jpg",
    rating: "partly meets expectations",
    description:
      "The staff falls below expectations in some areas of performance and often requires assistance from managers and/or peers. Requires some improvement to measure up to the job standards of his/her department.",
    taskDistribution: [
      { id: 0, label: "Creative", value: 77.5 },
      { id: 1, label: "Admin", value: 5.2 },
      { id: 2, label: "Admin meeting", value: 5.7 },
      { id: 3, label: "Project management", value: 3.2 },
      { id: 4, label: "Project meeting", value: 7.2 },
      { id: 5, label: "Proposal development", value: 0.7 },
      { id: 6, label: "Other", value: 0.5 },
    ],
    placeOfPerformance: [
      { id: 0, label: "Office", value: 99.3 },
      { id: 1, label: "Field", value: 0.5 },
      { id: 2, label: "Remote", value: 0.2 },
    ],
  },
  {
    id: 2,
    name: "Kaiya George",
    image: "/user/owner.jpg",
    rating: "meets expectations",
    description:
      "The staff consistently meets the performance standards required for their role and contributes effectively to their department's goals.",
    taskDistribution: [
      { id: 0, label: "Creative", value: 40.0 },
      { id: 1, label: "Admin", value: 15.0 },
      { id: 2, label: "Admin meeting", value: 10.0 },
      { id: 3, label: "Project management", value: 25.0 },
      { id: 4, label: "Project meeting", value: 10.0 },
    ],
    placeOfPerformance: [
      { id: 0, label: "Office", value: 70.0 },
      { id: 1, label: "Remote", value: 25.0 },
      { id: 2, label: "Field", value: 5.0 },
    ],
  },
];

const TASK_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#f97316",
];

const PLACE_COLORS = ["#10b981", "#ef4444", "#a855f7"];

const ratingColorMap: Record<string, string> = {
  "partly meets expectations": "text-amber-500",
  "meets expectations": "text-emerald-500",
  "exceeds expectations": "text-blue-500",
  "does not meet expectations": "text-red-500",
};

const EmployeeBreakdown = () => {
  const [selectedStaffId, setSelectedStaffId] = useState(STAFF[0].id);
  const staff = STAFF.find((s) => s.id === selectedStaffId) ?? STAFF[0];
  const ratingColor = ratingColorMap[staff.rating] ?? "text-gray-700";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-6">
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-6 pt-5 dark:border-gray-800 dark:bg-white/3 sm:px-6 sm:pt-6">
      {/* Staff Selector */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Staff Name :
        </label>
        <div className="relative inline-block">
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(Number(e.target.value))}
            className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800 min-w-45 cursor-pointer"
          >
            {STAFF.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400">
            ▾
          </span>
        </div>
      </div>

      {/* Staff Header */}
      <div className="flex items-start justify-between gap-4 mb-8 pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-gray-100 dark:border-gray-700">
            <Image
              src={staff.image}
              alt={staff.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(staff.name)}&background=10b981&color=fff`;
              }}
              width={80}
              height={80}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
              {staff.name}{" "}
              <span className={`font-semibold ${ratingColor}`}>
                {staff.rating}
              </span>
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl leading-relaxed">
              {staff.description}
            </p>
          </div>
        </div>
        <button className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors whitespace-nowrap">
          View profile
        </button>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Task Distribution */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-300 mb-2">
            Task Distribution
          </p>
          <PieChart
            series={[
              {
                data: staff.taskDistribution,
                arcLabel: (item) =>
                  item.value >= 3 ? `${item.value}%` : "",
                arcLabelMinAngle: 20,
                outerRadius: 110,
                cx: 180,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
                // valueFormatter,
              },
            ]}
            colors={TASK_COLORS}
            width={420}
            height={280}
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
            slotProps={{
              legend: {
                direction: "vertical",
                position: { vertical: "middle", horizontal: "end" },
              },
            }}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "#ffffff",
                fontSize: "10px",
                fontWeight: 600,
              },
            }}
          />
        </div>

        {/* Place of Performance */}
        <div className="flex flex-col items-center">
          <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500 mb-2">
            Place of Performance
          </p>
          <PieChart
            series={[
              {
                data: staff.placeOfPerformance,
                arcLabel: (item) =>
                  item.value >= 2 ? `${item.value}%` : "",
                arcLabelMinAngle: 15,
                outerRadius: 110,
                cx: 180,
                highlightScope: { fade: 'global', highlight: 'item' },
                faded: { innerRadius: 30, additionalRadius: -30, color: 'gray' },
              },
            ]}
            colors={PLACE_COLORS}
            width={420}
            height={280}
            margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
            slotProps={{
              legend: {
                direction: "vertical",
                position: { vertical: "middle", horizontal: "end" },
              },
            }}
            sx={{
              [`& .${pieArcLabelClasses.root}`]: {
                fill: "#ffffff",
                fontSize: "10px",
                fontWeight: 600,
              },
            }}
          />
        </div>
      </div>
    </div>
     <div className="lg:col-span-1">
      <EmployeeDistribution selectedStaffId={selectedStaffId} />
    </div>
    </div>
  );
};

export default EmployeeBreakdown;