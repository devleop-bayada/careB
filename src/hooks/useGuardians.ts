import { useQuery } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useGuardians(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  const url = qs ? `/api/guardians?${qs}` : "/api/guardians";

  const { data, isLoading, error } = useQuery({
    queryKey: ["guardians", params],
    queryFn: () => fetchData(url),
  });

  return {
    guardians: data?.guardians ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
}
