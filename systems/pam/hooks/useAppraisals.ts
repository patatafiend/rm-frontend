"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";
import {
  getMilestoneTab,
  isMilestoneResolved,
  isTerminal,
} from "../lib/utils/appraisal-table";
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
  const active = all.filter((r) => !isTerminal(r));

  const third = active.filter((r) => getMilestoneTab(r) === "third");
  const fifth = active.filter((r) => getMilestoneTab(r) === "fifth");
  const extension = active.filter(
    (r) =>
      getMilestoneTab(r) === "extension" &&
      !isMilestoneResolved(r, "extension_until"),
  );
  const resolved = all.filter(isTerminal);

  return {
    all,
    third,
    fifth,
    extension,
    resolved,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
  };
}
