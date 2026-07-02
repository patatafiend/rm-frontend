"use client";

import type { AppraisalRecord } from "@/systems/pam/types/appraisal";
import { getActiveMilestone } from "@/systems/pam/types/appraisal";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function MilestoneTimeline({ record }: { record: AppraisalRecord }) {
  const active = getActiveMilestone(record);

  const steps = [
    {
      key: "THIRD_MONTH",
      title: "3rd Month Review",
      dueDate: formatDate(record.third_month_due_date),
      status: record.third_month_decision ?? "Pending",
    },
    {
      key: "FIFTH_MONTH",
      title: "5th Month Review",
      dueDate: formatDate(record.fifth_month_due_date),
      status: record.fifth_month_decision ?? "Pending",
    },
    {
      key: "EXTENSION",
      title: "Extension Decision",
      dueDate: formatDate(record.extension_until),
      status: record.extension_final_decision ?? "Pending",
    },
  ] as const;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h3 className="text-base font-semibold text-gray-900">
        Milestone Timeline
      </h3>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {steps.map((step) => {
          const isActive = step.key === active;
          return (
            <div
              key={step.key}
              className={`rounded-xl border p-4 ${
                isActive
                  ? "border-amber-200 bg-amber-50/60"
                  : "border-gray-100 bg-gray-50/60"
              }`}
            >
              <p className="text-xs uppercase tracking-wide text-gray-400">
                {step.key.replace("_", " ")}
              </p>
              <h4 className="mt-1 font-semibold text-gray-900">{step.title}</h4>
              <p className="mt-2 text-sm text-gray-600">Due: {step.dueDate}</p>
              <p className="mt-1 text-sm text-gray-600">
                Status: {step.status}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
