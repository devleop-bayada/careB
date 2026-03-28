import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useBookmarks() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => fetchData("/api/bookmarks"),
  });

  return {
    bookmarks: data?.bookmarks ?? [],
    isLoading,
    error,
  };
}

export function useToggleBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      caregiverId,
      action,
      bookmarkId,
    }: {
      caregiverId: string;
      action: "add" | "remove";
      bookmarkId?: string;
    }) => {
      if (action === "remove" && bookmarkId) {
        const res = await fetch(`/api/bookmarks/${bookmarkId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to remove bookmark");
        return res.json();
      } else {
        const res = await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ caregiverId }),
        });
        if (!res.ok) throw new Error("Failed to add bookmark");
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookmarks"] });
    },
  });
}
