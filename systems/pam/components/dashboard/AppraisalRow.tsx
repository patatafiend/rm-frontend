"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";
import { MilestoneChip } from "./MilestoneChip";
import { StatusBadge } from "./StatusBadge";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AppraisalRow({ record }: { record: AppraisalRecord }) {
  const router = useRouter();
  const employeeName = record.employee_name ?? `RM ${record.rm_tran_no}`;

  return (
    <tr
      className="cursor-pointer bg-white transition-colors hover:bg-gray-50"
      onClick={() => router.push(`/appraisals/${record.rm_tran_no}`)}
    >
      <td className="px-4 py-3">
        <p className="font-medium text-gray-900">{employeeName}</p>
        <p className="text-xs text-gray-400">{record.rm_pos_applied ?? "—"}</p>
      </td>
      <td className="px-4 py-3 text-gray-600">{record.bu_tagging}</td>
      <td className="px-4 py-3 text-gray-600">
        {formatDate(record.contract_sdate)}
      </td>
      <td className="px-4 py-3">
        <MilestoneChip record={record} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={record.appraisal_status} />
      </td>
      <td className="px-4 py-3 text-right">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          onClick={(event) => {
            event.stopPropagation();
            router.push(`/appraisals/${record.rm_tran_no}`);
          }}
        >
          Open →
        </Button>
      </td>
    </tr>
  );
}
