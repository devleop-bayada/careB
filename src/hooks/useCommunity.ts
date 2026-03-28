import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useCommunityPosts(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  const url = qs ? `/api/community?${qs}` : "/api/community";

  const { data, isLoading, error } = useQuery({
    queryKey: ["community", "posts", params],
    queryFn: () => fetchData(url),
  });

  return {
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
}

export function useCommunityPost(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["community", "posts", id],
    queryFn: () => fetchData(`/api/community/${id}`),
    enabled: !!id,
  });

  return {
    post: data?.post ?? null,
    isLoading,
    error,
  };
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (body: {
      title: string;
      content: string;
      category: string;
      images?: string[];
    }) => {
      const res = await fetch("/api/community", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create post");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}

export function useToggleLike(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/community/${postId}/like`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed to toggle like");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["community", "posts"] });
    },
  });
}
