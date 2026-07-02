"use client";

import { useSearchParams } from "next/navigation";
import { StatusBadge } from "@/systems/pam/components/dashboard/StatusBadge";
import {
  getActiveMilestone,
  type AppraisalRecord,
} from "@/systems/pam/types/appraisal";
import { ExtensionDecisionForm } from "./ExtensionDecisionForm";
import { FifthMonthForm } from "./FifthMonthForm";
import { MilestoneTimeline } from "./MilestoneTimeline";
import { ThirdMonthForm } from "./ThirdMonthForm";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AppraisalDetail({ record }: { record: AppraisalRecord }) {
  const searchParams = useSearchParams();
  const fileKey = searchParams.get("file_key") ?? undefined;
  const activeMilestone = getActiveMilestone(record);
  const employeeName = record.employee_name ?? `RM ${record.rm_tran_no}`;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{employeeName}</h2>
            <p className="text-sm text-gray-400">
              {record.rm_pos_applied ?? "Probationary employee"}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              {record.hr_company ?? "Unknown company"}
              {record.hr_client ? ` · ${record.hr_client}` : ""}
            </p>
          </div>
          <StatusBadge status={record.appraisal_status} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
          <Stat label="BU" value={record.bu_tagging} />
          <Stat label="Start date" value={formatDate(record.contract_sdate)} />
          <Stat
            label="3rd month due"
            value={formatDate(record.third_month_due_date)}
          />
          <Stat
            label="5th month due"
            value={formatDate(record.fifth_month_due_date)}
          />
          <Stat
            label="Extension until"
            value={formatDate(record.extension_until)}
          />
          <Stat label="Active milestone" value={activeMilestone} />
        </div>
      </div>

      <MilestoneTimeline record={record} />

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <ThirdMonthForm record={record} defaultFileKey={fileKey} />
          <FifthMonthForm record={record} defaultFileKey={fileKey} />
          <ExtensionDecisionForm record={record} />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 text-sm text-gray-600 shadow-sm">
          <h3 className="text-base font-semibold text-gray-900">
            Record Notes
          </h3>
          <dl className="mt-4 space-y-3">
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                3rd month decision
              </dt>
              <dd className="font-medium text-gray-900">
                {record.third_month_decision ?? "Pending"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                5th month decision
              </dt>
              <dd className="font-medium text-gray-900">
                {record.fifth_month_decision ?? "Pending"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Extension decision
              </dt>
              <dd className="font-medium text-gray-900">
                {record.extension_final_decision ?? "Pending"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-gray-400">
                Failsafe reason
              </dt>
              <dd className="font-medium text-gray-900">
                {record.failsafe_reason ?? "None"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="font-medium text-gray-900">{value}</p>
    </div>
  );
}
