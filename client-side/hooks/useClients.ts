// hooks/useClientTasks.ts
import useSWR from "swr";
import { Client, Project } from "../types/types";
import { getAllClients, getClientProjects } from "@/services/clientService";

/**
 * Hook to fetch all clients
 */
export function useFetchClients() {
  const { data, error, isLoading, mutate } = useSWR<Client[]>(
    "all-clients", // Use a simple key instead of URL
    getAllClients,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    },
  );

  //   console.log(data);

  return {
    clients: data || [],
    isLoading,
    error,
    mutate,
  };
}

/**
 * Hook to fetch all client projects
 */
export function useClientProjects(id: number | null) {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(
    id ? ["client-projects", id] : null, // conditional fetch
    ([_, clientId]) => getClientProjects({ id: clientId as number }),
  );

  return {
    projects: data ?? [],
    isLoading,
    error,
    mutate,
  };
}
