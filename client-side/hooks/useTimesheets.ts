import { createTimesheet } from "@/services/timeSheetsService";
import { Timesheet, TimesheetCreateData } from "@/types/types";
import { useState } from "react";

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
