import {
  getActiveMilestone,
  type AppraisalRecord,
} from "@/systems/pam/types/appraisal";

const MAP = {
  THIRD_MONTH: {
    label: "3rd month",
    className: "bg-purple-50 text-purple-700",
  },
  FIFTH_MONTH: {
    label: "5th month",
    className: "bg-indigo-50 text-indigo-700",
  },
  EXTENSION: { label: "Extension", className: "bg-rose-50 text-rose-700" },
  RESOLVED: { label: "—", className: "text-gray-300" },
} as const;

export function MilestoneChip({ record }: { record: AppraisalRecord }) {
  const milestone = getActiveMilestone(record);
  const config = MAP[milestone];

  return (
    <span className={`text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  );
}
