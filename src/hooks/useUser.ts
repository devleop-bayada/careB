import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useUser() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["user", "me"],
    queryFn: () => fetchData("/api/users/me"),
  });

  return {
    user: data?.user ?? null,
    isLoading,
    error,
  };
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/users/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "me"] });
    },
  });
}
