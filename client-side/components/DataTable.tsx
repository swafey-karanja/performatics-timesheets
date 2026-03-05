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
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination";

interface Timesheet {
  id: number;
  task_description: string;
  client: string;
  task_date: string;
  start_time: string;
  end_time: string;
  total_minutes: number;
  status?: string;
}

function formatTime(timeStr: string): string {
  if (!timeStr) return "—";
  const [hourStr, minuteStr] = timeStr.split(":");
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr;
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute} ${ampm}`;
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatHours(totalMinutes: number): string {
  if (totalMinutes == null) return "—";
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

interface DataTableProps {
  onView?: (timesheet: Timesheet) => void;
  onEdit?: (timesheet: Timesheet) => void;
}

const dummyTimesheets: Timesheet[] = [
  {
    id: 1,
    task_description: "Designed new landing page wireframes for client review",
    client: "Mediaforce Communications (MFC)",
    task_date: "2025-03-01",
    start_time: "08:00:00",
    end_time: "11:30:00",
    total_minutes: 210,
  },
  {
    id: 2,
    task_description: "Backend API integration for user authentication module",
    client: "Safaricom PLC",
    task_date: "2025-03-02",
    start_time: "09:00:00",
    end_time: "13:00:00",
    total_minutes: 240,
  },
  {
    id: 3,
    task_description: "Weekly social media content calendar preparation",
    client: "Kenya Airways",
    task_date: "2025-03-03",
    start_time: "10:00:00",
    end_time: "12:00:00",
    total_minutes: 120,
  },
  {
    id: 4,
    task_description: "Bug fixes on the candidate portal dashboard",
    client: "Equity Bank",
    task_date: "2025-03-04",
    start_time: "14:00:00",
    end_time: "17:45:00",
    total_minutes: 225,
  },
  {
    id: 5,
    task_description: "Client onboarding call and requirements documentation",
    client: "Strathmore University",
    task_date: "2025-03-05",
    start_time: "11:00:00",
    end_time: "12:30:00",
    total_minutes: 90,
  },
  {
    id: 6,
    task_description: "Quarterly report design and data visualisation",
    client: "Equity Bank",
    task_date: "2025-03-06",
    start_time: "09:30:00",
    end_time: "12:30:00",
    total_minutes: 180,
  },
  {
    id: 7,
    task_description: "SEO audit and keyword research for blog posts",
    client: "Mediaforce Communications (MFC)",
    task_date: "2025-03-07",
    start_time: "08:00:00",
    end_time: "10:00:00",
    total_minutes: 120,
  },
  {
    id: 8,
    task_description: "Mobile app UI review and feedback session",
    client: "Safaricom PLC",
    task_date: "2025-03-08",
    start_time: "13:00:00",
    end_time: "15:30:00",
    total_minutes: 150,
  },
  {
    id: 9,
    task_description: "Database schema optimisation for timesheets module",
    client: "Strathmore University",
    task_date: "2025-03-09",
    start_time: "10:00:00",
    end_time: "14:00:00",
    total_minutes: 240,
  },
  {
    id: 10,
    task_description: "Email campaign template design and copywriting",
    client: "Kenya Airways",
    task_date: "2025-03-10",
    start_time: "09:00:00",
    end_time: "11:00:00",
    total_minutes: 120,
  },
  {
    id: 11,
    task_description: "Sprint planning meeting and backlog grooming",
    client: "Equity Bank",
    task_date: "2025-03-11",
    start_time: "14:00:00",
    end_time: "16:00:00",
    total_minutes: 120,
  },
  {
    id: 12,
    task_description: "Accessibility review on candidate portal",
    client: "Safaricom PLC",
    task_date: "2025-03-12",
    start_time: "08:30:00",
    end_time: "10:30:00",
    total_minutes: 120,
  },
  {
    id: 13,
    task_description: "Integration testing for payroll export feature",
    client: "Mediaforce Communications (MFC)",
    task_date: "2025-03-13",
    start_time: "11:00:00",
    end_time: "14:30:00",
    total_minutes: 210,
  },
  {
    id: 14,
    task_description: "Stakeholder presentation preparation and rehearsal",
    client: "Kenya Airways",
    task_date: "2025-03-14",
    start_time: "15:00:00",
    end_time: "17:00:00",
    total_minutes: 120,
  },
  {
    id: 15,
    task_description: "User research interviews for new dashboard features",
    client: "Strathmore University",
    task_date: "2025-03-15",
    start_time: "09:00:00",
    end_time: "12:00:00",
    total_minutes: 180,
  },
  {
    id: 16,
    task_description: "Performance profiling and load testing on API",
    client: "Equity Bank",
    task_date: "2025-03-16",
    start_time: "10:00:00",
    end_time: "13:00:00",
    total_minutes: 180,
  },
  {
    id: 17,
    task_description: "Content audit and sitemap restructuring",
    client: "Kenya Airways",
    task_date: "2025-03-17",
    start_time: "08:00:00",
    end_time: "10:30:00",
    total_minutes: 150,
  },
];

const PAGE_SIZE = 10;

const uniqueClients = Array.from(
  new Set(dummyTimesheets.map((t) => t.client))
).sort();

export default function DataTable({ onView, onEdit }: DataTableProps) {
  const timesheets = dummyTimesheets;

  const [search, setSearch] = useState("");
  const [clientFilter, setClientFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  //   const [timesheets, setTimesheets] = useState<Timesheet[]>([]);
  //   const [loading, setLoading] = useState(true);
  //   const [error, setError] = useState<string | null>(null);

  //   useEffect(() => {
  //     const fetchTimesheets = async () => {
  //       try {
  //         const token = localStorage.getItem("accessToken");
  //         const response = await fetch(
  //           `${process.env.NEXT_PUBLIC_API_URL}/api/timesheets`,
  //           {
  //             headers: {
  //               Authorization: `Bearer ${token}`,
  //               "Content-Type": "application/json",
  //             },
  //           }
  //         );
  //         if (!response.ok) {
  //           throw new Error(`Failed to fetch timesheets: ${response.status}`);
  //         }
  //         const data = await response.json();
  //         setTimesheets(data);
  //       } catch (err) {
  //         setError(err instanceof Error ? err.message : "Failed to load timesheets");
  //       } finally {
  //         setLoading(false);
  //       }
  //     };
  //     fetchTimesheets();
  //   }, []);

  //   if (loading) {
  //     return (
  //       <div className="flex items-center justify-center py-16">
  //         <CircularProgress size={32} />
  //         <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
  //           Loading timesheets...
  //         </span>
  //       </div>
  //     );
  //   }

  //   if (error) {
  //     return (
  //       <div className="flex items-center justify-center py-16">
  //         <span className="text-sm text-red-500">{error}</span>
  //       </div>
  //     );
  //   }

  //   if (timesheets.length === 0) {
  //     return (
  //       <div className="flex items-center justify-center py-16">
  //         <span className="text-sm text-gray-500 dark:text-gray-400">
  //           No timesheets found.
  //         </span>
  //       </div>
  //     );
  //   }

  const filtered = useMemo(() => {
    return timesheets.filter((t) => {
      const matchesSearch =
        search.trim() === "" ||
        t.task_description.toLowerCase().includes(search.toLowerCase()) ||
        t.client.toLowerCase().includes(search.toLowerCase());

      const matchesClient =
        clientFilter === "all" || t.client === clientFilter;

      const matchesFrom =
        dateFrom === "" || new Date(t.task_date) >= new Date(dateFrom);

      const matchesTo =
        dateTo === "" || new Date(t.task_date) <= new Date(dateTo);

      return matchesSearch && matchesClient && matchesFrom && matchesTo;
    });
  }, [search, clientFilter, dateFrom, dateTo, timesheets]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset to page 1 whenever filters change
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };
  const handleClientFilter = (value: string) => {
    setClientFilter(value);
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
    setClientFilter("all");
    setDateFrom("");
    setDateTo("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    search !== "" ||
    clientFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

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
              placeholder="Search by task or client..."
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
                  clientFilter !== "all",
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
                value={clientFilter}
                onChange={(e) => handleClientFilter(e.target.value)}
                className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800 min-w-50"
              >
                <option value="all">All Clients</option>
                {uniqueClients.map((c) => (
                  <option key={c} value={c}>
                    {c}
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

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/5 dark:bg-white/3">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-275.5">
            <Table>
              {/* Table Header */}
              <TableHeader className="border-b border-gray-100 dark:border-white/5">
                <TableRow>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Task Description
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Client
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Date
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Check In
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Check Out
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Hours
                  </TableCell>
                  <TableCell
                    isHeader
                    className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                      No timesheets match your search or filters.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((timesheet) => (
                    <TableRow key={timesheet.id}>
                      <TableCell className="px-5 py-5 text-start max-w-150">
                        <span
                          className="block font-normal text-gray-800 text-theme-sm dark:text-white/90 truncate"
                          title={timesheet.task_description}
                        >
                          {timesheet.task_description}
                        </span>
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                        {timesheet.client}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                        {formatDate(timesheet.task_date)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                        {formatTime(timesheet.start_time)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                        {formatTime(timesheet.end_time)}
                      </TableCell>
                      <TableCell className="px-5 py-3 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap">
                        {formatHours(timesheet.total_minutes)}
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

     {/* Pagination */}
<div className="flex items-center justify-between px-1">
  <span className="text-sm text-gray-500 dark:text-gray-400">
    Showing{" "}
    <span className="font-medium text-gray-700 dark:text-gray-300">
      {filtered.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1}
    </span>{" "}
    –{" "}
    <span className="font-medium text-gray-700 dark:text-gray-300">
      {Math.min(currentPage * PAGE_SIZE, filtered.length)}
    </span>{" "}
    of{" "}
    <span className="font-medium text-gray-700 dark:text-gray-300">
      {filtered.length}
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
        // Always show first, last, current, and neighbours — ellipsis the rest
        const showPage =
          page === 1 ||
          page === totalPages ||
          Math.abs(page - currentPage) <= 1;

        const showEllipsisBefore =
          page === currentPage - 2 && currentPage - 2 > 1;

        const showEllipsisAfter =
          page === currentPage + 2 && currentPage + 2 < totalPages;

        if (!showPage && !showEllipsisBefore && !showEllipsisAfter) return null;

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
          className={currentPage === totalPages ? "pointer-events-none opacity-40" : ""}
        />
      </PaginationItem>
    </PaginationContent>
  </Pagination>
</div>
    </div>
  );
}