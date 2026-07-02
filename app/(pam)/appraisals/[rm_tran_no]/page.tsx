"use client";

import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppraisalDetail } from "@/systems/pam/hooks/useAppraisals";
import { AppraisalDetail } from "@/systems/pam/components/detail/AppraisalDetail";

export default function AppraisalDetailPage({
  params,
}: {
  params: Promise<{ rm_tran_no: string }>;
}) {
  const { rm_tran_no } = use(params);
  const { data, isLoading } = useAppraisalDetail(Number(rm_tran_no));

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (!data) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 bg-white p-6 text-sm text-gray-500 shadow-sm">
        Appraisal record not found.
      </div>
    );
  }

  return <AppraisalDetail record={data} />;
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64 rounded-lg" />
      <Skeleton className="h-32 w-full rounded-xl" />
      <Skeleton className="h-20 w-full rounded-xl" />
    </div>
  );
}
