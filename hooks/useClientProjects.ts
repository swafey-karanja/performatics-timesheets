// hooks/useClientTasks.ts
import useSWR from "swr";
import { FormPayload, ProjectType } from "../types/types";
import { fetchClientProjects } from "@/services/projectService";

export const useClientProjects = (
  client: string | null,
  basePayload: FormPayload,
  cookie: string,
) => {
  const fetcher = () => {
    if (!client) return Promise.resolve([] as ProjectType);
    return fetchClientProjects(client, basePayload, cookie);
  };

  const { data, error, isLoading } = useSWR<ProjectType>(
    client ? `client-tasks-${client}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: true,
    },
  );

  return {
    projects: data || [],
    error,
    isLoading,
  };
};
