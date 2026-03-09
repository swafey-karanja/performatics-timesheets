"use client";

import React from "react";
import AppModal from "@/components/ui/Modal";
import { TimesheetRow } from "@/types/timesheets.types";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(timeStr: string | null | undefined): string {
  if (!timeStr) return "—";
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minuteStr} ${ampm}`;
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatHours(hoursSpent: number | string | null | undefined): string {
  if (hoursSpent == null) return "—";
  const h = parseFloat(String(hoursSpent));
  const hrs = Math.floor(h);
  const mins = Math.round((h - hrs) * 60);
  return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
}

const stationColour: Record<string, "default" | "primary" | "success"> = {
  Office: "primary",
  Field: "success",
  Remote: "default",
};

// ─── Detail Row ───────────────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className="text-md text-gray-600 font-medium">
        {value ?? "—"}
      </span>
    </div>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface ViewTimesheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  timesheet: TimesheetRow | null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ViewTimesheetModal({
  isOpen,
  onClose,
  timesheet,
}: ViewTimesheetModalProps) {
  if (!timesheet) return null;

  const duration = (() => {
    const h = parseFloat(String(timesheet.hours_spent ?? 0));
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return { hrs, mins, total: formatHours(timesheet.hours_spent) };
  })();

  return (
    <AppModal isOpen={isOpen} onClose={onClose} title="Timesheet Details">
      <div className="flex flex-col gap-6 min-w-200 max-w-2xl">

        {/* ── Staff & ID banner ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between p-4 rounded-xl bg-gray-100 border border-gray-100">
          <div className="flex items-center gap-3">
            {/* Avatar initials */}
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-sm shrink-0">
              {timesheet.staff_name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <div>
              <p className="text-md font-medium text-gray-600">
                {timesheet.staff_name}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {timesheet.department_name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Chip
              label={timesheet.task_station}
              size="medium"
              color={stationColour[timesheet.task_station] ?? "default"}
              variant="outlined"
            />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              #{timesheet.timesheet_id}
            </span>
          </div>
        </div>

        {/* ── Task info ────────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <DetailRow label="Task Type" value={timesheet.task_type} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold uppercase tracking-wide text-gray-400">
              Task Description
            </span>
            <p className="text-md text-gray-600 font-medium leading-relaxed whitespace-pre-wrap">
              {timesheet.task_description}
            </p>
          </div>
        </div>

        <Divider />

        {/* ── Date & Time ──────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Date" value={formatDate(timesheet.date)} />

          <DetailRow
            label="Duration"
            value={
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-green-50 text-green-700 dark:text-green-400 text-sm font-semibold">
                {duration.total}
              </span>
            }
          />
          <DetailRow label="Check In" value={formatTime(timesheet.check_in_time)} />
          <DetailRow label="Check Out" value={formatTime(timesheet.check_out_time)} />
        </div>

        <Divider />

        {/* ── Client & Project ─────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <DetailRow label="Client" value={timesheet.client_name} />
          <DetailRow label="Project" value={timesheet.project_name} />
        </div>
      </div>
    </AppModal>
  );
}