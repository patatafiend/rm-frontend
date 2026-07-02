"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";
import { useAppraisalsStore } from "@/systems/pam/store/appraisals.store";
import type {
  ExtensionPayload,
  FifthMonthPayload,
  ThirdMonthPayload,
} from "@/systems/pam/types/appraisal";

const STALE_TIME = 2 * 60 * 1000;

export function useAppraisalDashboard() {
  const { accessToken } = useAuthStore();
  const { selectedStatus, setAppraisals, setLoading, setRefetching, setError } =
    useAppraisalsStore();

  const query = useQuery({
    queryKey: ["pam", "list", accessToken, selectedStatus],
    queryFn: async () => {
      const res = await appraisalsApi.list(selectedStatus ?? undefined);
      setAppraisals(res.data, res.total);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    setRefetching(query.isRefetching);
  }, [query.isRefetching, setRefetching]);

  useEffect(() => {
    if (query.error) {
      const message =
        query.error instanceof Error
          ? query.error.message
          : "Failed to load appraisals";
      setError(message);
      toast.error(message);
      return;
    }

    setError(null);
  }, [query.error, setError]);

  return { isLoading: query.isLoading, isRefetching: query.isRefetching };
}

export function useAppraisalDetail(rmTranNo: number) {
  const { accessToken } = useAuthStore();

  return useQuery({
    queryKey: ["pam", "detail", accessToken, rmTranNo],
    queryFn: async () => appraisalsApi.detail(rmTranNo),
    staleTime: STALE_TIME,
    enabled: !!accessToken && !!rmTranNo,
  });
}

export function useAppraisalMutations(rmTranNo: number) {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["pam"] });

  const submitThird = useMutation({
    mutationFn: (body: ThirdMonthPayload) =>
      appraisalsApi.submitThirdMonth(rmTranNo, body),
    onSuccess: () => {
      invalidate();
      toast.success("3rd month appraisal submitted.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Submission failed.",
      );
    },
  });

  const submitFifth = useMutation({
    mutationFn: (body: FifthMonthPayload) =>
      appraisalsApi.submitFifthMonth(rmTranNo, body),
    onSuccess: () => {
      invalidate();
      toast.success("5th month appraisal submitted.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Submission failed.",
      );
    },
  });

  const submitExtension = useMutation({
    mutationFn: (body: ExtensionPayload) =>
      appraisalsApi.submitExtension(rmTranNo, body),
    onSuccess: () => {
      invalidate();
      toast.success("Extension decision recorded.");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Submission failed.",
      );
    },
  });

  return { submitThird, submitFifth, submitExtension };
}

export function useAppraisalRefresh() {
  const queryClient = useQueryClient();
  return {
    refresh: () => queryClient.invalidateQueries({ queryKey: ["pam"] }),
  };
}

export function useNotifications() {
  const { accessToken } = useAuthStore();
  const { setNotifications } = useAppraisalsStore();

  return useQuery({
    queryKey: ["pam", "notifications", accessToken],
    queryFn: async () => {
      const res = await appraisalsApi.notifications(true);
      setNotifications(res.data);
      return res;
    },
    staleTime: 60 * 1000,
    enabled: !!accessToken,
  });
}
