import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useCareRecipients() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["care-recipients"],
    queryFn: () => fetchData("/api/care-recipients"),
  });

  return {
    recipients: data?.careRecipients ?? [],
    isLoading,
    error,
  };
}

export function useCreateRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const res = await fetch("/api/care-recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create care recipient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-recipients"] });
    },
  });
}

export function useUpdateRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...body
    }: Record<string, unknown> & { id: string }) => {
      const res = await fetch(`/api/care-recipients/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to update care recipient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-recipients"] });
    },
  });
}

export function useDeleteRecipient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/care-recipients/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete care recipient");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["care-recipients"] });
    },
  });
}
