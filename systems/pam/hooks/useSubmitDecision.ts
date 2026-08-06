"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";
import type {
  ExtensionPayload,
  FifthMonthPayload,
  ThirdMonthPayload,
} from "@/systems/pam/types/appraisal";

export function useSubmitDecision(employeeId: number) {
  const queryClient = useQueryClient();

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["pam"] });

  const thirdMonth = useMutation({
    mutationFn: (body: ThirdMonthPayload) =>
      appraisalsApi.submitThirdMonth(employeeId, body),
    onSuccess: () => {
      invalidate();
      toast.success("3rd month appraisal submitted.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Submission failed."),
  });

  const fifthMonth = useMutation({
    mutationFn: (body: FifthMonthPayload) =>
      appraisalsApi.submitFifthMonth(employeeId, body),
    onSuccess: () => {
      invalidate();
      toast.success("5th month appraisal submitted.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Submission failed."),
  });

  const extension = useMutation({
    mutationFn: (body: ExtensionPayload) =>
      appraisalsApi.submitExtension(employeeId, body),
    onSuccess: () => {
      invalidate();
      toast.success("Extension decision recorded.");
    },
    onError: (err) =>
      toast.error(err instanceof Error ? err.message : "Submission failed."),
  });

  const isPending =
    thirdMonth.isPending || fifthMonth.isPending || extension.isPending;

  return { thirdMonth, fifthMonth, extension, isPending };
}