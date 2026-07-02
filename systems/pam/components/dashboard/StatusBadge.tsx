import type { AppraisalStatus } from "@/systems/pam/types/appraisal";

const CONFIG: Record<AppraisalStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-blue-50 text-blue-700" },
  FOR_REGULARIZATION: {
    label: "For regularization",
    className: "bg-amber-50 text-amber-700",
  },
  REGULARIZED: {
    label: "Regularized",
    className: "bg-green-50 text-green-700",
  },
  NON_REGULARIZED: {
    label: "Non-regularized",
    className: "bg-red-50 text-red-700",
  },
  NEEDS_REVIEW: {
    label: "Needs review",
    className: "bg-orange-50 text-orange-700",
  },
  RESOLVED_MANUAL: {
    label: "Resolved",
    className: "bg-gray-100 text-gray-600",
  },
};

export function StatusBadge({ status }: { status: AppraisalStatus }) {
  const config = CONFIG[status] ?? CONFIG.PENDING;

  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
