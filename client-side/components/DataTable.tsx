"use client";
import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "./ui/table/index";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import CircularProgress from "@mui/material/CircularProgress";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import { useTimesheets } from "../hooks/useTimesheets";
import { TimesheetRow } from "../types/timesheets.types";
import { useFetchClients } from "@/hooks/useClients";

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

// ─── Props ────────────────────────────────────────────────────────────────────

interface DataTableProps {
  /** When provided, only timesheets for this staff member are loaded */
  staffId?: number;
  onView?: (timesheet: TimesheetRow) => void;
  onEdit?: (timesheet: TimesheetRow) => void;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

// ─── Component ────────────────────────────────────────────────────────────────

export default function DataTable({ staffId, onView, onEdit }: DataTableProps) {
  // ── Local filter state (client-side text search + date range) ──────────────
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
    const [clientId, setClientId] = useState<number | null>(null);

  // ── Build query params for the hook ───────────────────────────────────────
  // Search and date range are passed to the API so the server filters them.
  // Page / limit drive server-side pagination.
  const queryParams = useMemo(
  () => ({
    page: currentPage,
    limit: PAGE_SIZE,
    ...(search.trim() ? { search: search.trim() } : {}),
    ...(dateFrom ? { startDate: dateFrom } : {}),
    ...(dateTo ? { endDate: dateTo } : {}),
    ...(staffId ? { staffId } : {}),
    ...(clientId ? { clientId } : {}), // ← passes the ID to the API
  }),
  [currentPage, search, dateFrom, dateTo, staffId, clientId]
);

  const { data: timesheets, pagination, loading, error } = useTimesheets(queryParams);

  // ── Derive unique client names from the current page for the filter select ──
  // The client filter is kept as a local UI-only filter on top of the fetched page.


  const { clients } = useFetchClients();

  // ── Local client filter (applied on top of the API results) ─────────────────
  const filtered = useMemo(() => {
    if (clientId === null) return timesheets;
    return timesheets.filter((t) => t.client_id === clientId);
  }, [timesheets, clientId]);

  // ── Pagination values ────────────────────────────────────────────────────────
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.total ?? 0;
  const pageStart =
    totalCount === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1;
  const pageEnd = Math.min(currentPage * PAGE_SIZE, totalCount);

  // ── Filter handlers ──────────────────────────────────────────────────────────
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleDateFrom = (value: string) => {
    setDateFrom(value);
    setCurrentPage(1);
  };

  const handleDateTo = (value: string) => {
    setDateTo(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setClientId(null);
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search !== "" || clientId !== null || dateFrom !== "" || dateTo !== "";

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <SearchIcon fontSize="small" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by task, staff or client..."
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg border transition-colors ${
              showFilters || hasActiveFilters
                ? "border-brand-500 bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500"
                : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
          >
            <FilterListIcon fontSize="small" />
            Filters
            {hasActiveFilters && (
              <span className="flex items-center justify-center w-4 h-4 text-xs font-bold rounded-full bg-brand-500 text-white">
                {[
                  search !== "",
                  clientId !== null,
                  dateFrom !== "",
                  dateTo !== "",
                ].filter(Boolean).length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Expanded Filter Row */}
        {showFilters && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            {/* Client Filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Client
              </label>
              <select
                value={clientId ?? ""}
                onChange={(e) =>
                  setClientId(e.target.value ? Number(e.target.value) : null)
                }
                className="..."
              >
                <option value="">All Clients</option>
                {clients.map((c) => (
                  <option key={c.client_id} value={c.client_id}>
                    {c.client_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Date From
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => handleDateFrom(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                Date To
              </label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => handleDateTo(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <CircularProgress size={28} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading timesheets…
          </span>
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="flex items-center justify-center py-16">
          <span className="text-sm text-red-500 dark:text-red-400">{error}</span>
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
          <div className="max-w-full overflow-x-auto">
            <div className="min-w-275.5">
              <Table>
                {/* Table Header */}
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    {[
                      "Task Description",
                      "Client",
                      "Date",
                      "Check In",
                      "Check Out",
                      "Hours",
                      "Actions",
                    ].map((heading) => (
                      <TableCell
                        key={heading}
                        isHeader
                        className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                      >
                        {heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                {/* Table Body */}
                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                        No timesheets match your search or filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((timesheet) => (
                      <TableRow key={timesheet.timesheet_id}>
                        <TableCell className="px-5 py-5 text-start max-w-150">
                          <span
                            className="block font-normal text-gray-800 text-theme-sm dark:text-white/90 truncate"
                            title={timesheet.task_description}
                          >
                            {timesheet.task_description}
                          </span>
                        </TableCell>
                        <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                          {timesheet.client_name ?? "—"}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                          {formatDate(timesheet.date)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                          {formatTime(timesheet.check_in_time)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                          {formatTime(timesheet.check_out_time)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                          {formatHours(timesheet.hours_spent)}
                        </TableCell>
                        <TableCell className="px-5 py-3 text-start">
                          <div className="flex items-center gap-3">
                            <Tooltip title="View details">
                              <IconButton
                                size="small"
                                onClick={() => onView?.(timesheet)}
                                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <VisibilityIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit timesheet">
                              <IconButton
                                size="small"
                                onClick={() => onEdit?.(timesheet)}
                                className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && (
        <div className="flex items-center justify-between px-1">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {pageStart}
            </span>{" "}
            –{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {pageEnd}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {totalCount}
            </span>{" "}
            results
          </span>

          <Pagination className="mx-0 w-auto">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={currentPage === 1 ? "pointer-events-none opacity-40" : ""}
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  Math.abs(page - currentPage) <= 1;
                const showEllipsisBefore =
                  page === currentPage - 2 && currentPage - 2 > 1;
                const showEllipsisAfter =
                  page === currentPage + 2 && currentPage + 2 < totalPages;

                if (!showPage && !showEllipsisBefore && !showEllipsisAfter)
                  return null;

                if (showEllipsisBefore || showEllipsisAfter) {
                  return (
                    <PaginationItem key={`ellipsis-${page}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  );
                }

                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      href="#"
                      isActive={page === currentPage}
                      onClick={(e) => {
                        e.preventDefault();
                        setCurrentPage(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-40"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}