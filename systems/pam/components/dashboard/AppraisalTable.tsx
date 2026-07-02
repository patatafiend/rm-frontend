"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { useAppraisalsStore } from "@/systems/pam/store/appraisals.store";
import { AppraisalRow } from "./AppraisalRow";

export function AppraisalTable({ isLoading }: { isLoading: boolean }) {
  const { appraisals } = useAppraisalsStore();

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (appraisals.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-200 py-16 text-center">
        <p className="text-sm text-gray-400">
          No appraisal records match this filter.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-400">
            <th className="px-4 py-3 text-left font-medium">Employee</th>
            <th className="px-4 py-3 text-left font-medium">BU</th>
            <th className="px-4 py-3 text-left font-medium">Start date</th>
            <th className="px-4 py-3 text-left font-medium">Milestone</th>
            <th className="px-4 py-3 text-left font-medium">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {appraisals.map((record) => (
            <AppraisalRow key={record.rm_tran_no} record={record} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
