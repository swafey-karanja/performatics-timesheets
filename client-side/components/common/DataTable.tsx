"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../ui/table/index";
import CircularProgress from "@mui/material/CircularProgress";
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
} from "../ui/pagination";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  /** Column header label */
  heading: string;
  /** Render the cell content for a given row */
  render: (row: T) => React.ReactNode;
  /** Optional className for the <TableCell> */
  className?: string;
}

export interface FilterControl {
  label: string;
  element: React.ReactNode;
}

export interface ReusableTableProps<T> {
  // ── Data ──────────────────────────────────────────────────────────────────
  rows: T[];
  columns: ColumnDef<T>[];
  rowKey: (row: T) => string | number;

  // ── State ─────────────────────────────────────────────────────────────────
  loading: boolean;
  error?: string | null;

  // ── Search ────────────────────────────────────────────────────────────────
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;

  // ── Filters ───────────────────────────────────────────────────────────────
  /** Additional filter controls rendered inside the collapsible filter panel */
  filterControls?: FilterControl[];
  showFilters: boolean;
  onToggleFilters: () => void;
  hasActiveFilters: boolean;
  activeFilterCount: number;
  onClearFilters: () => void;

  // ── Pagination ────────────────────────────────────────────────────────────
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;

  // ── Empty state ───────────────────────────────────────────────────────────
  emptyMessage?: string;

  // ── Tabs (optional) ───────────────────────────────────────────────────────
  /** Rendered above the search bar — pass null/undefined to omit */
  tabBar?: React.ReactNode;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DataTable<T>({
  rows,
  columns,
  rowKey,
  loading,
  error,
  search,
  onSearchChange,
  searchPlaceholder = "Search…",
  filterControls,
  showFilters,
  onToggleFilters,
  hasActiveFilters,
  activeFilterCount,
  onClearFilters,
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  emptyMessage = "No records match your search or filters.",
  tabBar,
}: ReusableTableProps<T>) {
  const pageStart = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const pageEnd = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="flex flex-col gap-4">
      {/* Optional Tab Bar */}
      {tabBar}

      {/* Search + Filter Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          {/* Search input */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
              <SearchIcon fontSize="small" />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-800 dark:text-white/90 placeholder:text-gray-400 dark:placeholder:text-white/30 focus:outline-none focus:border-brand-300 dark:focus:border-brand-800 focus:ring-2 focus:ring-brand-500/10"
            />
          </div>

          {/* Filter toggle */}
          {filterControls && filterControls.length > 0 && (
            <button
              onClick={onToggleFilters}
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
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}

          {/* Clear all */}
          {hasActiveFilters && (
            <button
              onClick={onClearFilters}
              className="px-3 py-2 text-sm text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 transition-colors"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Collapsible filter panel */}
        {showFilters && filterControls && filterControls.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            {filterControls.map((fc) => (
              <div key={fc.label} className="flex flex-col gap-1">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {fc.label}
                </label>
                {fc.element}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16 gap-3">
          <CircularProgress size={28} />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading…
          </span>
        </div>
      )}

      {/* Error */}
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
                <TableHeader className="border-b border-gray-100 dark:border-white/5">
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell
                        key={col.heading}
                        isHeader
                        className="px-5 py-4 font-bold text-black text-start text-lg dark:text-gray-400"
                      >
                        {col.heading}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody className="divide-y divide-gray-100 dark:divide-white/5">
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell className="px-5 py-12 text-center text-sm text-gray-400 dark:text-gray-500">
                        {emptyMessage}
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => (
                      <TableRow
                        key={rowKey(row)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        {columns.map((col) => (
                          <TableCell
                            key={col.heading}
                            className={
                              col.className ??
                              "px-5 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400"
                            }
                          >
                            {col.render(row)}
                          </TableCell>
                        ))}
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
                    onPageChange(Math.max(1, currentPage - 1));
                  }}
                  aria-disabled={currentPage === 1}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-40 text-black dark:text-gray-400"
                      : "text-black dark:text-gray-400"
                  }
                />
              </PaginationItem>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1;
                  const showEllipsisBefore =
                    page === currentPage - 2 && currentPage - 2 > 1;
                  const showEllipsisAfter =
                    page === currentPage + 2 &&
                    currentPage + 2 < totalPages;

                  if (!showPage && !showEllipsisBefore && !showEllipsisAfter)
                    return null;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <PaginationItem
                        key={`ellipsis-${page}`}
                        className="text-black dark:text-gray-400"
                      >
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
                          onPageChange(page);
                        }}
                        className="text-black dark:text-gray-400"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                },
              )}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(Math.min(totalPages, currentPage + 1));
                  }}
                  aria-disabled={currentPage === totalPages}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-40 text-black dark:text-gray-400"
                      : "text-black dark:text-gray-400"
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

export default DataTable;