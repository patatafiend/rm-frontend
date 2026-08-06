"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";

const STALE_TIME = 2 * 60 * 1000;

export function useAppraisalDetail(employeeId: number | null) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["pam", "detail", accessToken, employeeId],
    queryFn: () => appraisalsApi.detail(employeeId!),
    staleTime: STALE_TIME,
    enabled: !!accessToken && !!employeeId,
  });
}