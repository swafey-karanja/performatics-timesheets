// hooks/useClientTasks.ts
import useSWR from "swr";
import { Client, ClientOption, Project } from "../types/types";
import { fetchClients, getClientProjects } from "@/services/clientService";
import { useEffect, useState } from "react";



interface UseClientsResult {
  clients: ClientOption[];
  loading: boolean;
  error: string | null;
}

export function useFetchClients(): UseClientsResult {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchClients()
      .then((data) => {
        if (!cancelled) setClients(data);
      })
      .catch((err) => {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Failed to load clients");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []); // runs once — client list doesn't change during a session

  return { clients, loading, error };
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
