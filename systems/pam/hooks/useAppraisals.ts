"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";
import { getMilestoneTab } from "@/systems/pam/types/appraisal";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";

const STALE_TIME = 2 * 60 * 1000;

export function useAppraisals() {
  const { accessToken } = useAuthStore();

  const query = useQuery({
    queryKey: ["pam", "list", accessToken],
    queryFn: () => appraisalsApi.list(),
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  const all: AppraisalRecord[] = query.data?.data ?? [];

  const third = all.filter((r) => getMilestoneTab(r) === "third");
  const fifth = all.filter((r) => getMilestoneTab(r) === "fifth");
  // Extension tab: only those with fifth_month_decision EXTENSION and no final decision yet
  const extension = all.filter(
    (r) =>
      getMilestoneTab(r) === "extension" && !r.extension_final_decision,
  );

  return {
    all,
    third,
    fifth,
    extension,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
  };
}