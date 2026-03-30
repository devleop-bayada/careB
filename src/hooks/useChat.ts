import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useChatList() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chat", "rooms"],
    queryFn: () => fetchData("/api/chat"),
  });

  return {
    chats: data?.rooms ?? [],
    isLoading,
    error,
  };
}

export function useChatMessages(matchId: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["chat", "messages", matchId],
    queryFn: () => fetchData(`/api/chat/${matchId}`),
    enabled: !!matchId,
    refetchInterval: 3000,
  });

  return {
    messages: data?.messages ?? [],
    isLoading,
    error,
  };
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      content,
      imageUrl,
    }: {
      matchId: string;
      content: string;
      imageUrl?: string | null;
    }) => {
      const res = await fetch(`/api/chat/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, imageUrl }),
      });
      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["chat", "messages", variables.matchId],
      });
      queryClient.invalidateQueries({ queryKey: ["chat", "rooms"] });
    },
  });
}
