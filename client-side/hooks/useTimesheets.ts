import { createTimesheet, fetchTimesheets, fetchTimesheetsByStaffId } from "@/services/timeSheetsService";
import { PaginationMeta, TimesheetQueryParams, TimesheetRow, UseTimesheetsResult } from "@/types/timesheets.types";
import { Timesheet, TimesheetCreateData } from "@/types/types";
import { useState, useEffect, useCallback } from "react";




/**
 * Fetches all timesheets. Re-fetches whenever `params` values change.
 *
 * @param params - Query options (page, limit, search, filters, …)
 */
export function useTimesheets(
  params: TimesheetQueryParams = {}
): UseTimesheetsResult {
  const [data, setData] = useState<TimesheetRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stable serialised key so the effect only re-runs when params actually change
  const paramsKey = JSON.stringify(params);

  // Increment this to trigger a manual refetch without changing params
  const [refetchIndex, setRefetchIndex] = useState(0);
  const refetch = useCallback(() => setRefetchIndex((n) => n + 1), []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTimesheets(params);
        if (!cancelled) {
          setData(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load timesheets");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey, refetchIndex]);

  return { data, pagination, loading, error, refetch };
}

// ─── useTimesheetsByStaffId ────────────────────────────────────────────────────

/**
 * Fetches timesheets for a specific staff member.
 * Skips the request when `staffId` is falsy (0 / undefined / null).
 *
 * @param staffId - The staff member's ID
 * @param params  - Query options (page, limit, search, filters, …)
 */
export function useTimesheetsByStaffId(
  staffId: number | null | undefined,
  params: Omit<TimesheetQueryParams, "staffId"> = {}
): UseTimesheetsResult {
  const [data, setData] = useState<TimesheetRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const paramsKey = JSON.stringify(params);
  const [refetchIndex, setRefetchIndex] = useState(0);
  const refetch = useCallback(() => setRefetchIndex((n) => n + 1), []);

  useEffect(() => {
    if (!staffId) {
      setData([]);
      setPagination(null);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchTimesheetsByStaffId(staffId, params);
        if (!cancelled) {
          setData(result.data);
          setPagination(result.pagination);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load timesheets"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [staffId, paramsKey, refetchIndex]);

  return { data, pagination, loading, error, refetch };
}


/**
 * Hook for creating a new timesheet entry
 */
export function useCreateTimesheet() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<Timesheet | null>(null);

  const submit = async (timesheetData: TimesheetCreateData) => {
    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      const result = await createTimesheet(timesheetData);
      setData(result);
      return result;
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to create timesheet");
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setData(null);
  };

  return {
    submit,
    isLoading,
    error,
    data,
    reset,
  };
}
