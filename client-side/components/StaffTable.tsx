"use client";

import React, { useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import ReusableTable, { ColumnDef, FilterControl } from "./common/DataTable";
import { useStaff } from "@/hooks/useStaff";
import { Staff } from "@/types/types";
import { useDebouncedValue } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const WORK_TYPES = ["Employment", "Consultancy", "Internship"] as const;
const STATUSES = ["Active", "Suspended"] as const;

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status?: "Active" | "Suspended" }) {
  if (!status) return <span className="text-gray-400 dark:text-gray-500">—</span>;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        status === "Active"
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
          : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
      }`}
    >
      {status}
    </span>
  );
}

function WorkTypeBadge({ workType }: { workType: Staff["work_type"] }) {
  const styles: Record<Staff["work_type"], string> = {
    Employment: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    Consultancy: "bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400",
    Internship: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[workType]}`}
    >
      {workType}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StaffTableProps {
  onView?: (staff: Staff) => void;
  onEdit?: (staff: Staff) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffTable({ onView, onEdit }: StaffTableProps) {
  const { staff, isLoading, error } = useStaff();

  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [workType, setWorkType] = useState<Staff["work_type"] | "">("");
  const [status, setStatus] = useState<"Active" | "Suspended" | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  // ── Client-side filtering ───────────────────────────────────────────────────
  // Staff is fetched in full — filtering and pagination are done locally
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return (staff ?? []).filter((s) => {
      const matchesSearch =
        !q ||
        s.staff_name.toLowerCase().includes(q) ||
        s.staff_role.toLowerCase().includes(q) ||
        (s.work_email ?? "").toLowerCase().includes(q) ||
        (s.department_name ?? "").toLowerCase().includes(q);

      const matchesWorkType = !workType || s.work_type === workType;
      const matchesStatus = !status || s.status === status;

      return matchesSearch && matchesWorkType && matchesStatus;
    });
  }, [staff, debouncedSearch, workType, status]);

  // ── Client-side pagination ──────────────────────────────────────────────────
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const hasActiveFilters = search !== "" || workType !== "" || status !== "";

  const activeFilterCount = [
    search !== "",
    workType !== "",
    status !== "",
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setWorkType("");
    setStatus("");
    setCurrentPage(1);
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<Staff>[] = [
    {
      heading: "Name",
      className: "px-5 py-4 text-start",
      render: (s) => (
        <div>
          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {s.staff_name}
          </p>
          {s.username && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
              @{s.username}
            </p>
          )}
        </div>
      ),
    },
    {
      heading: "Role",
      className:
        "px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400",
      render: (s) => s.staff_role,
    },
    {
      heading: "Department",
      className:
        "px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap",
      render: (s) => s.department_name ?? "—",
    },
    {
      heading: "Work Type",
      className: "px-5 py-4 text-start",
      render: (s) => <WorkTypeBadge workType={s.work_type} />,
    },
    {
      heading: "Email",
      className:
        "px-5 py-4 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (s) => s.work_email ?? s.personal_email,
    },
    {
      heading: "Joined",
      className:
        "px-5 py-4 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (s) => formatDate(s.date_joined),
    },
    {
      heading: "Status",
      className: "px-5 py-4 text-start",
      render: (s) => <StatusBadge status={s.status} />,
    },
    {
      heading: "Actions",
      className: "px-5 py-4 text-start",
      render: (s) => (
        <div className="flex items-center gap-2">
          <Tooltip title="View profile">
            <IconButton
              size="small"
              onClick={() => onView?.(s)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <VisibilityIcon
                fontSize="small"
                className="text-gray-500 dark:text-gray-400"
              />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit staff">
            <IconButton
              size="small"
              onClick={() => onEdit?.(s)}
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            >
              <EditIcon
                fontSize="small"
                className="text-gray-500 dark:text-gray-400"
              />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Filter controls ─────────────────────────────────────────────────────────
  const filterControls: FilterControl[] = [
    {
      label: "Work Type",
      element: (
        <select
          value={workType}
          onChange={(e) => {
            setWorkType(e.target.value as Staff["work_type"] | "");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        >
          <option value="">All Types</option>
          {WORK_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      ),
    },
    {
      label: "Status",
      element: (
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "Active" | "Suspended" | "");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      ),
    },
  ];

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ReusableTable
      rows={pageRows}
      columns={columns}
      rowKey={(s) => s.staff_id}
      loading={isLoading}
      error={error?.message}
      search={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by name, role, department or email..."
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
      emptyMessage="No staff members match your search or filters."
    />
  );
}