import { useQuery } from "@tanstack/react-query";

async function fetchData(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

export function useCaregivers(params?: Record<string, string>) {
  const searchParams = new URLSearchParams(params);
  const qs = searchParams.toString();
  const url = qs ? `/api/caregivers?${qs}` : "/api/caregivers";

  const { data, isLoading, error } = useQuery({
    queryKey: ["caregivers", params],
    queryFn: () => fetchData(url),
  });

  return {
    caregivers: data?.caregivers ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error,
  };
}

export function useCaregiver(id: string | undefined) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["caregivers", id],
    queryFn: () => fetchData(`/api/caregivers/${id}`),
    enabled: !!id,
  });

  return {
    caregiver: data?.caregiver ?? null,
    isLoading,
    error,
  };
}

export function useRecommendedCaregivers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["caregivers", "recommend"],
    queryFn: () => fetchData("/api/caregivers/recommend"),
  });

  return {
    recommendations: data?.recommendations ?? [],
    isLoading,
    error,
  };
}
