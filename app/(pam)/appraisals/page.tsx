"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppraisalTable } from "@/systems/pam/components/dashboard/AppraisalTable";
import {
  useAppraisalDashboard,
  useAppraisalRefresh,
} from "@/systems/pam/hooks/useAppraisals";
import { useAppraisalsStore } from "@/systems/pam/store/appraisals.store";

export default function AppraisalsPage() {
  const { isLoading, isRefetching } = useAppraisalDashboard();
  const { refresh } = useAppraisalRefresh();
  const { total } = useAppraisalsStore();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Performance Appraisals
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            {total} employee{total === 1 ? "" : "s"} in the regularization queue
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={refresh}
            disabled={isRefetching}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
            {isRefetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      <AppraisalTable isLoading={isLoading} />
    </div>
  );
}
