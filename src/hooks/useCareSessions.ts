import { useQuery } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useCareSessions() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["care-sessions"],
    queryFn: () => fetchData("/api/care-sessions"),
  });

  return {
    sessions: data?.sessions ?? [],
    isLoading,
    error,
  };
}

export function useCareSession(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["care-sessions", id],
    queryFn: () => fetchData(`/api/care-sessions/${id}`),
    enabled: !!id,
  });

  return {
    session: data?.session ?? null,
    isLoading,
    error,
  };
}
