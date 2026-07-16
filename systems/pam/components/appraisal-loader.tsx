"use client";

import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { AppraisalTabs } from "./appraisal-tabs";
import { useAppraisals } from "@/systems/pam/hooks/useAppraisals";

export function AppraisalsLoader() {
  const { third, fifth, extension, resolved, isLoading, error } = useAppraisals();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        <AlertCircle className="h-4 w-4 shrink-0" />
        {error instanceof Error ? error.message : "Failed to load appraisals."}
      </div>
    );
  }

  return <AppraisalTabs third={third} fifth={fifth} extension={extension} resolved={resolved}/>;
}