"use client";

import React, { useMemo, useState } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import BlockIcon from "@mui/icons-material/Block";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ReusableTable, { ColumnDef, FilterControl } from "./common/DataTable";
import {
  useStaffAccounts,
} from "@/hooks/useStaff";
import { useDebouncedValue } from "@/lib/utils";
import { AccountRole, AccountStatus, StaffAccount } from "@/types/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;
const STATUSES: AccountStatus[] = ["Active", "Suspended"];
const ROLES: AccountRole[] = ["Admin", "Manager", "Staff"];

// ─── Formatters ───────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: AccountStatus }) {
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

function RoleBadge({ role }: { role: AccountRole }) {
  const styles: Record<AccountRole, string> = {
    Admin:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    Manager:
      "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    Staff:
      "bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-400",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[role]}`}
    >
      {role}
    </span>
  );
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface StaffAccountsTableProps {
  onView?: (account: StaffAccount) => void;
  onEdit?: (account: StaffAccount) => void;
  /** Called when the suspend/activate toggle is clicked */
  onToggleStatus?: (account: StaffAccount) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function StaffAccountsTable({
  onView,
  onEdit,
  onToggleStatus,
}: StaffAccountsTableProps) {
  const { accounts, isLoading, error } = useStaffAccounts();

  // ── Filter / search state ───────────────────────────────────────────────────
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<AccountRole | "">("");
  const [status, setStatus] = useState<AccountStatus | "">("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debouncedSearch = useDebouncedValue(search, 300);

  // ── Client-side filtering ───────────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();

    return accounts.filter((a) => {
      const matchesSearch =
        !q ||
        a.staff_name.toLowerCase().includes(q) ||
        a.username.toLowerCase().includes(q) ||
        a.work_email.toLowerCase().includes(q) ||
        (a.department_name ?? "").toLowerCase().includes(q) ||
        a.staff_role.toLowerCase().includes(q);

      const matchesRole = !role || a.role === role;
      const matchesStatus = !status || a.status === status;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [accounts, debouncedSearch, role, status]);

  // ── Client-side pagination ──────────────────────────────────────────────────
  const totalCount = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const pageRows = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // ── Filter helpers ──────────────────────────────────────────────────────────
  const hasActiveFilters = search !== "" || role !== "" || status !== "";

  const activeFilterCount = [
    search !== "",
    role !== "",
    status !== "",
  ].filter(Boolean).length;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setRole("");
    setStatus("");
    setCurrentPage(1);
  };

  // ── Column definitions ──────────────────────────────────────────────────────
  const columns: ColumnDef<StaffAccount>[] = [
    {
      heading: "Staff Member",
      className: "px-5 py-4 text-start",
      render: (a) => (
        <div>
          <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
            {a.staff_name}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {a.staff_role}
          </p>
        </div>
      ),
    },
    {
      heading: "Username",
      className:
        "px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400",
      render: (a) => (
        <span className="font-mono text-sm text-gray-600 dark:text-gray-300">
          @{a.username}
        </span>
      ),
    },
    {
      heading: "Work Email",
      className:
        "px-5 py-4 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (a) => a.work_email,
    },
    {
      heading: "Department",
      className:
        "px-5 py-4 text-gray-500 text-start text-theme-sm dark:text-gray-400 whitespace-nowrap",
      render: (a) => a.department_name ?? "—",
    },
    {
      heading: "Role",
      className: "px-5 py-4 text-start",
      render: (a) => <RoleBadge role={a.role} />,
    },
    {
      heading: "Status",
      className: "px-5 py-4 text-start",
      render: (a) => <StatusBadge status={a.status} />,
    },
    {
      heading: "Registered",
      className:
        "px-5 py-4 text-gray-500 text-start text-[13px] dark:text-gray-400 whitespace-nowrap",
      render: (a) => formatDate(a.date_registered),
    },
    {
      heading: "Actions",
      className: "px-5 py-4 text-start",
      render: (a) => (
        <div className="flex items-center gap-1">
          <Tooltip title="View account">
            <IconButton
              size="small"
              onClick={() => onView?.(a)}
              className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
            >
              <VisibilityIcon
                fontSize="small"
                className="text-gray-500 dark:text-gray-400"
              />
            </IconButton>
          </Tooltip>

          <Tooltip title="Edit account">
            <IconButton
              size="small"
              onClick={() => onEdit?.(a)}
              className="text-gray-500 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
            >
              <EditIcon
                fontSize="small"
                className="text-gray-500 dark:text-gray-400"
              />
            </IconButton>
          </Tooltip>

          <Tooltip title={a.status === "Active" ? "Suspend account" : "Activate account"}>
            <IconButton
              size="small"
              onClick={() => onToggleStatus?.(a)}
              className={
                a.status === "Active"
                  ? "text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                  : "text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              }
            >
              {a.status === "Active" ? (
                <BlockIcon
                  fontSize="small"
                  className="text-gray-500 dark:text-gray-400"
                />
              ) : (
                <CheckCircleOutlineIcon
                  fontSize="small"
                  className="text-gray-500 dark:text-gray-400"
                />
              )}
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ];

  // ── Filter controls ─────────────────────────────────────────────────────────
  const filterControls: FilterControl[] = [
    {
      label: "Role",
      element: (
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as AccountRole | "");
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800"
        >
          <option value="">All Roles</option>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
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
            setStatus(e.target.value as AccountStatus | "");
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
      rowKey={(a) => a.account_id}
      loading={isLoading}
      error={error?.message}
      search={search}
      onSearchChange={handleSearchChange}
      searchPlaceholder="Search by name, username, email or department..."
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
      emptyMessage="No staff accounts match your search or filters."
    />
  );
}