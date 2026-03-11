"use client";

import { useState, useMemo } from "react";
import { PieChart, pieArcLabelClasses } from "@mui/x-charts";
import Image from "next/image";
import EmployeeDistribution from "./EmployeeDistribution";
import { useFetchTimesheetsByStaffId } from "@/hooks/useTimesheets";
import { Staff } from "@/types/types";

const TASK_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#f97316",
  "#14b8a6",
  "#e11d48",
  "#84cc16",
  "#a78bfa",
  "#fb923c",
  "#22d3ee",
  "#facc15",
  "#4ade80",
];

const PLACE_COLORS = ["#10b981", "#ef4444", "#a855f7"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Aggregates timesheet rows into percentage-based pie chart data,
 * grouping small slices under a given threshold into "Other".
 */
function buildDistribution(
  entries: { value: string }[],
  threshold = 2,
): { id: number; label: string; value: number }[] {
  if (!entries.length) return [];

  // Count occurrences
  const counts: Record<string, number> = {};
  for (const { value } of entries) {
    counts[value] = (counts[value] ?? 0) + 1;
  }

  const total = entries.length;

  // Convert to percentages
  const slices = Object.entries(counts).map(([label, count]) => ({
    label,
    value: Math.round((count / total) * 1000) / 10, // 1 decimal place
  }));

  // Separate small slices into "Other"
  const significant = slices.filter((s) => s.value >= threshold);
  const otherTotal = slices
    .filter((s) => s.value < threshold)
    .reduce((sum, s) => sum + s.value, 0);

  const result = significant.map((s, id) => ({ id, ...s }));

  if (otherTotal > 0) {
    result.push({
      id: result.length,
      label: "Other",
      value: Math.round(otherTotal * 10) / 10,
    });
  }

  return result;
}

// ─── Component ────────────────────────────────────────────────────────────────

const EmployeeBreakdown = ({staff, staffLoading}: { staff: Staff[]; staffLoading: boolean }) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

  // Default to first staff member once loaded
  const resolvedStaffId: number | null =
    selectedStaffId ?? (staff && staff.length > 0 ? staff[0].staff_id : null);

  const selectedStaff: Staff | undefined = staff?.find(
    (s) => s.staff_id === resolvedStaffId,
  );

  const {
    data: timesheets,
    loading: timesheetsLoading,
    error: timesheetsError,
  } = useFetchTimesheetsByStaffId(resolvedStaffId);

  // Derive chart data from timesheets
  const taskDistribution = useMemo(() => {
    if (!timesheets?.length) return [];
    return buildDistribution(
      timesheets.map((t) => ({ value: t.task_type })),
    );
  }, [timesheets]);

  const placeOfPerformance = useMemo(() => {
    if (!timesheets?.length) return [];
    return buildDistribution(
      timesheets.map((t) => ({ value: t.task_station })),
      0, // show all three stations even if < 2%
    );
  }, [timesheets]);

  // ── Render states ────────────────────────────────────────────────────────────

  if (staffLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/3 animate-pulse h-64" />
    );
  }

  if (!staff?.length || !selectedStaff) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-white/3">
        <p className="text-sm text-gray-500">No staff data available.</p>
      </div>
    );
  }

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
              value={resolvedStaffId ?? ""}
              onChange={(e) => setSelectedStaffId(Number(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800 min-w-45 cursor-pointer"
            >
              {staff.map((s) => (
                <option key={s.staff_id} value={s.staff_id}>
                  {s.staff_name}
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
                src="/user/owner.jpg"
                alt={selectedStaff.staff_name}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStaff.staff_name)}&background=10b981&color=fff`;
                }}
                width={80}
                height={80}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-white/90">
                {selectedStaff.staff_name}
              </h3>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {selectedStaff.staff_role}
                {selectedStaff.department_name && (
                  <span className="ml-2 text-gray-400 dark:text-gray-500">
                    · {selectedStaff.department_name}
                  </span>
                )}
              </p>
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                {selectedStaff.work_type} · Joined{" "}
                {new Date(selectedStaff.date_joined).toLocaleDateString(
                  "en-GB",
                  { month: "short", year: "numeric" },
                )}
              </p>
            </div>
          </div>
          <button className="shrink-0 px-4 py-2 text-sm font-medium text-white bg-brand-500 hover:bg-brand-600 rounded-lg transition-colors whitespace-nowrap">
            View profile
          </button>
        </div>

        {/* Charts Row */}
        {timesheetsLoading ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400 animate-pulse">
            Loading timesheet data…
          </div>
        ) : timesheetsError ? (
          <div className="flex items-center justify-center h-48 text-sm text-gray-400">
            No timesheet entries found for this staff member.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Task Distribution */}
            <div className="flex flex-col items-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-300 mb-2">
                Task Distribution
              </p>
              <PieChart
                series={[
                  {
                    data: taskDistribution,
                    arcLabel: (item) =>
                      item.value >= 3 ? `${item.value}%` : "",
                    arcLabelMinAngle: 20,
                    outerRadius: 110,
                    cx: 180,
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
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
                    data: placeOfPerformance,
                    arcLabel: (item) =>
                      item.value >= 2 ? `${item.value}%` : "",
                    arcLabelMinAngle: 15,
                    outerRadius: 110,
                    cx: 180,
                    highlightScope: { fade: "global", highlight: "item" },
                    faded: {
                      innerRadius: 30,
                      additionalRadius: -30,
                      color: "gray",
                    },
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
        )}
      </div>

      <div className="lg:col-span-1">
        <EmployeeDistribution selectedStaffId={resolvedStaffId} />
      </div>
    </div>
  );
};

export default EmployeeBreakdown;