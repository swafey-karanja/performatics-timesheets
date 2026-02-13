import { getAllDepartments } from "@/services/departmentsService";
import { Department } from "@/types/types";
import useSWR from "swr";

/**
 * Hook to fetch all departments
 */
export function useDepartments() {
  const { data, error, isLoading, mutate } = useSWR<Department[]>(
    "all-departments", // Use a simple key instead of URL
    getAllDepartments,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    departments: data || [],
    isLoading,
    error,
    mutate,
  };
}
