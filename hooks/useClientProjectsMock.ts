// hooks/useClientTasks.ts
import useSWR from "swr";
import { FormPayload, ProjectType } from "../types/types";
import { fetchClientProjectsMock } from "@/services/mockProjectService";

export const useClientProjectsMock = (
  client: string | null,
  basePayload: FormPayload,
) => {
  const fetcher = () => {
    if (!client) return Promise.resolve([] as ProjectType);
    return fetchClientProjectsMock(client, basePayload);
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
