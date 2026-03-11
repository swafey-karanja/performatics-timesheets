"use client";

import React, { useState, useMemo } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import { useTimesheets, useFetchTimesheetsByStaffId } from "@/hooks/useTimesheets";
import { TimesheetRow } from "../types/timesheets.types";
import { useFetchClients } from "@/hooks/useClients";
import { useDebouncedValue } from "@/lib/utils";
import ReusableTable, { ColumnDef, FilterControl } from "./common/DataTable";

// ─── Formatters ───────────────────────────────────────────────────────────────

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
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHours(hoursSpent: number | null | undefined): string {
  if (hoursSpent == null) return "—";
  const h = Math.floor(hoursSpent);
  const m = Math.round((hoursSpent - h) * 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type TabMode = "mine" | "all";

export interface LoggedInAccount {
  staff_id: number;
  role: "Admin" | "Manager" | "Staff";
}

interface TimesheetsTableProps {
  onView?: (timesheet: TimesheetRow) => void;
  onEdit?: (timesheet: TimesheetRow) => void;
  refetchKey?: number;
  account: LoggedInAccount | null;
}

const PAGE_SIZE = 10;

// ─── Tab Bar ──────────────────────────────────────────────────────────────────

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative pb-3 text-lg font-bold transition-colors focus:outline-none ${
        active
          ? "text-red-600 dark:text-red-400"
          : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-0 left-0 right-0 h-1 rounded-full bg-red-600 dark:bg-red-400" />
      )}
    </button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TimesheetsTable({
  onView,
  onEdit,
  refetchKey = 0,
  account
}: TimesheetsTableProps) {

  const isPrivileged =
    account?.role === "Admin" || account?.role === "Manager";

  // ── UI state ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<TabMode>("mine");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [clientId, setClientId] = useState<number | null>(null);

  const debouncedSearch = useDebouncedValue(search, 500);

  // ── Tab change ──────────────────────────────────────────────────────────────
  const handleTabChange = (tab: TabMode) => {
    if (!isPrivileged && tab !== "mine") return;
    setActiveTab(tab);
    setCurrentPage(1);
    setSearch("");
    setClientId(null);
    setDateFrom("");
    setDateTo("");
  };

  // ── Shared query params ─────────────────────────────────────────────────────
  const sharedParams = useMemo(
    () => ({
      page: currentPage,
      limit: PAGE_SIZE,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(dateFrom ? { startDate: dateFrom } : {}),
      ...(dateTo ? { endDate: dateTo } : {}),
      ...(clientId ? { clientId } : {}),
      refetchKey,
    }),
    [currentPage, debouncedSearch, dateFrom, dateTo, clientId, refetchKey],
  );

  // ── Data fetching ───────────────────────────────────────────────────────────
  const myTimesheets = useFetchTimesheetsByStaffId(
    activeTab === "mine" ? (account?.staff_id ?? null) : null,
    sharedParams,
  );

  const allTimesheets = useTimesheets(
    activeTab === "all" ? sharedParams : { page: 1, limit: 1 },
  );

  const { data: timesheets, pagination, loading, error } =
    activeTab === "mine" ? myTimesheets : allTimesheets;

  const { clients } = useFetchClients();

  // ── Pagination helpers ──────────────────────────────────────────────────────
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.total ?? 0;

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const hasActiveFilters =
    search !== "" || clientId !== null || dateFrom !== "" || dateTo !== "";

  const activeFilterCount = [
    search !== "",
    clientId !== null,
    dateFrom !== "",
    dateTo !== "",
  ].filter(Boolean).length;

  const clearFilters = () => {
    setSearch("");
    setClientId(null);
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<TimesheetRow>[] = [
    {
      heading: "Task Description",
      className: "px-5 py-5 text-start max-w-150",
      render: (row) => (
        <span
          className="block font-normal text-gray-800 text-theme-sm dark:text-white/90 truncate"
          title={row.task_description}
        >
          {row.task_description}
        </span>
      ),
    },
    // "Staff" column only visible in "all" tab
    ...(activeTab === "all"
      ? [
          {
            heading: "Staff",
            className:
              "px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap",
            render: (row: TimesheetRow) => row.staff_name,
          } satisfies ColumnDef<TimesheetRow>,
        ]
      : []),
    {
      heading: "Date",
      className:
        "px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (row) => formatDate(row.date),
    },
    {
      heading: "Check In",
      className:
        "px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (row) => formatTime(row.check_in_time),
    },
    {
      heading: "Check Out",
      className:
        "px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (row) => formatTime(row.check_out_time),
    },
    {
      heading: "Client",
      className:
        "px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400",
      render: (row) => row.client_name ?? "—",
    },
    {
      heading: "Hours",
      className:
        "px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (row) => formatHours(row.hours_spent),
    },
    {
      heading: "Actions",
      className: "px-5 py-3 text-start",
      render: (row) => (
        <div className="flex items-center gap-3">
          <Tooltip title="View details">
            <IconButton
              size="small"
              onClick={() => onView?.(row)}
              className="text-gray-500 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
            >
              <VisibilityIcon
                fontSize="small"
                className="text-gray-500 dark:text-gray-400"
              />
            </IconButton>
          </Tooltip>
          {activeTab === "mine" && (
            <Tooltip title="Edit timesheet">
              <IconButton
                size="small"
                onClick={() => onEdit?.(row)}
                className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
              >
                <EditIcon
                  fontSize="small"
                  className="text-gray-500 dark:text-gray-400"
                />
              </IconButton>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  // ── Filter controls ─────────────────────────────────────────────────────────
  const filterControls: FilterControl[] = [
    {
      label: "Client",
      element: (
        <select
          value={clientId ?? ""}
          onChange={(e) =>
            setClientId(e.target.value ? Number(e.target.value) : null)
          }
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.client_id} value={c.client_id}>
              {c.client_name}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Date From",
      element: (
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => {
            setDateFrom(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        />
      ),
    },
    {
      label: "Date To",
      element: (
        <input
          type="date"
          value={dateTo}
          onChange={(e) => {
            setDateTo(e.target.value);
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        />
      ),
    },
  ];

  // ── Tab bar ─────────────────────────────────────────────────────────────────
  const tabBar = isPrivileged ? (
    <div className="flex items-center gap-6 border-b border-gray-200 dark:border-white/10">
      <TabButton
        label="My Timesheet"
        active={activeTab === "mine"}
        onClick={() => handleTabChange("mine")}
      />
      <TabButton
        label="All Timesheets"
        active={activeTab === "all"}
        onClick={() => handleTabChange("all")}
      />
    </div>
  ) : undefined;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ReusableTable
      rows={timesheets}
      columns={columns}
      rowKey={(row) => row.timesheet_id}
      loading={loading}
      error={error}
      search={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by task, staff or client..."
      filterControls={filterControls}
      showFilters={showFilters}
      onToggleFilters={() => setShowFilters((prev) => !prev)}
      hasActiveFilters={hasActiveFilters}
      activeFilterCount={activeFilterCount}
      onClearFilters={clearFilters}
      currentPage={currentPage}
      totalPages={totalPages}
      totalCount={totalCount}
      pageSize={PAGE_SIZE}
      onPageChange={setCurrentPage}
      emptyMessage="No timesheets match your search or filters."
      tabBar={tabBar}
    />
  );
}