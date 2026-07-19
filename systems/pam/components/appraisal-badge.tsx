import type {
  AppraisalRecord,
  AppraisalStatus,
} from "@/systems/pam/types/appraisal";
import { cn } from "@/lib/utils";
import { differenceInCalendarDays, parseISO } from "date-fns";
import {
  isMilestoneResolved,
  getDisplayDate,
} from "../lib/utils/appraisal-table";
interface Props {
  record: AppraisalRecord;
  /** Which due date to check for overdue calculation */
  dueDateField:
    | "third_month_due_date"
    | "fifth_month_due_date"
    | "extension_until";
}

type BadgeVariant = "pending" | "overdue" | "done" | "for-reg" | "resolved";

function getVariant(
  record: AppraisalRecord,
  dueDateField: Props["dueDateField"],
): BadgeVariant {
  const terminalDone: AppraisalStatus[] = [
    "REGULARIZED",
    "NON_REGULARIZED",
    "RESOLVED_MANUAL",
  ];
  if (terminalDone.includes(record.appraisal_status)) return "resolved";
  if (record.appraisal_status === "FOR_REGULARIZATION") return "for-reg";

  // Check if this specific milestone has a decision
  const hasDecision = isMilestoneResolved(record, dueDateField);

  if (hasDecision) return "done";

  const dueRaw = getDisplayDate(record, dueDateField);
  if (dueRaw) {
    const daysLeft = differenceInCalendarDays(parseISO(dueRaw), new Date());
    if (daysLeft < 0) return "overdue";
  }

  return "pending";
}

const BADGE_STYLES: Record<BadgeVariant, string> = {
  pending: "bg-gray-100 text-gray-600",
  overdue: "bg-amber-100 text-amber-700",
  done: "bg-green-100 text-green-700",
  "for-reg": "bg-red-100 text-red-700",
  resolved: "bg-slate-100 text-slate-500",
};

const BADGE_LABELS: Record<BadgeVariant, string> = {
  pending: "Pending",
  overdue: "Overdue",
  done: "Done",
  "for-reg": "For Reg.",
  resolved: "Resolved",
};

const BADGE_DOTS: Record<BadgeVariant, string> = {
  pending: "bg-gray-400",
  overdue: "bg-amber-500",
  done: "bg-green-500",
  "for-reg": "bg-red-500",
  resolved: "bg-slate-400",
};

export function AppraisalBadge({ record, dueDateField }: Props) {
  const variant = getVariant(record, dueDateField);
  const missingThird = isMissingThirdMonthPA(record);
  const missingFifth = isMissingFifthMonthPA(record);

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
          BADGE_STYLES[variant],
        )}
      >
        <span className={cn("h-1.5 w-1.5 rounded-full", BADGE_DOTS[variant])} />
        {BADGE_LABELS[variant]}
      </span>
      {missingThird && (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-inset ring-red-200">
          No 3rd Mo. PA
        </span>
      )}
      {missingFifth && (
        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-medium text-red-600 ring-1 ring-inset ring-red-200">
          No 5th Mo. PA
        </span>
      )}
    </span>
  );
}
export function getDaysOverdue(
  record: AppraisalRecord,
  dueDateField: Props["dueDateField"],
): number | null {
  const dueRaw = getDisplayDate(record, dueDateField);
  if (!dueRaw) return null;
  const days = differenceInCalendarDays(new Date(), parseISO(dueRaw));
  return days > 0 ? days : null;
}

export function isMissingThirdMonthPA(record: AppraisalRecord): boolean {
  return record.third_month_decision == null && !!record.fifth_month_notified_at;
}

export function isMissingFifthMonthPA(record: AppraisalRecord): boolean {
  return record.fifth_month_decision === "NO_APPRAISAL";
}