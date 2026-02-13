// hooks/useClientTasks.ts
import useSWR from "swr";
import { Project } from "../types/types";
import { getAllProjects } from "@/services/projectsService";

/**
 * Hook to fetch all projects
 */
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    "all-projects", // Use a simple key instead of URL
    getAllProjects,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  return {
    projects: data || [],
    isLoading,
    error,
    mutate,
  };
}
