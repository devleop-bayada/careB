import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useMatches(status?: string) {
  const url = status ? `/api/matches?status=${status}` : "/api/matches";

  const { data, isLoading, error } = useQuery({
    queryKey: ["matches", status],
    queryFn: () => fetchData(url),
  });

  return {
    matches: data?.matches ?? [],
    isLoading,
    error,
  };
}

export function useMatch(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["matches", id],
    queryFn: () => fetchData(`/api/matches/${id}`),
    enabled: !!id,
  });

  return {
    match: data?.match ?? null,
    isLoading,
    error,
  };
}

export function useUpdateMatchStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      cancelReason,
    }: {
      id: string;
      status: string;
      cancelReason?: string;
    }) => {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, cancelReason }),
      });
      if (!res.ok) throw new Error("Failed to update match status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
    },
  });
}
