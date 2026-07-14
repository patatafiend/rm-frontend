import {
  AppraisalRecord,
  DueDateField,
  SortKey,
  SortConfig,
  ExtensionRecord,
  ActiveMilestone,
} from "../../types/appraisal";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

export function getPageWindows(
  current: number,
  total: number,
): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (
    let i = Math.max(2, current - 2);
    i <= Math.min(total - 1, current + 2);
    i++
  ) {
    pages.add(i);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result: (number | "...")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push("...");
    result.push(sorted[i]);
  }
  return result;
}

interface Props {
  records: AppraisalRecord[];
  dueDateField: DueDateField;
  dueDateLabel: string;
  /** Renders the terminal-status view instead of the pending/overdue milestone view. */
  resolvedOnly?: boolean;
}
// Declared OUTSIDE AppraisalTable so these aren't recreated (and don't reset
// their identity) on every render. They receive sortConfig/onSort as props
// instead of closing over component-local state.
export function SortIcon({
  column,
  sortConfig,
}: {
  column: SortKey;
  sortConfig: SortConfig | null;
}) {
  if (!sortConfig || sortConfig.key !== column) {
    return (
      <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />
    );
  }
  return sortConfig.direction === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
}

export function isTerminal(record: AppraisalRecord): boolean {
  return ["REGULARIZED", "NON_REGULARIZED", "RESOLVED_MANUAL"].includes(
    record.appraisal_status,
  );
}

export function getResolvedDate(record: AppraisalRecord): string | null {
  if (
    record.appraisal_status === "REGULARIZED" ||
    record.appraisal_status === "NON_REGULARIZED"
  ) {
    const latest = getLatestExtension(record);
    return (
      latest?.decided_at ??
      record.fifth_month_decided_at ??
      record.third_month_decided_at ??
      null
    );
  }
  // RESOLVED_MANUAL has no dedicated timestamp in the current schema —
  // falling back to confirmed_at. Flag: confirm this is actually correct.
  return record.confirmed_at ?? null;
}

export function getDisplayDate(
  record: AppraisalRecord,
  field: DueDateField,
  resolvedOnly?: boolean,
): string | null {
  return resolvedOnly ? getResolvedDate(record) : getDueDate(record, field);
}

export function getDueDate(
  record: AppraisalRecord,
  field: DueDateField,
): string | null {
  if (field === "extension_until") {
    return getLatestExtension(record)?.extension_until ?? null;
  }
  return record[field] ?? null;
}

export function isMilestoneResolved(
  record: AppraisalRecord,
  field: DueDateField,
): boolean {
  if (field === "extension_until") {
    const latest = getLatestExtension(record);
    // "EXTENSION" decision means "extend again" — a new record gets created,
    // so a resolved extension is one whose latest decision is a final outcome.
    return !!latest?.decision && latest.decision !== "EXTENSION";
  }
  if (field === "third_month_due_date") return !!record.third_month_decision;
  if (field === "fifth_month_due_date") return !!record.fifth_month_decision;
  return false;
}

export function SortableHead({
  column,
  sortConfig,
  onSort,
  children,
}: {
  column: SortKey;
  sortConfig: SortConfig | null;
  onSort: (key: SortKey) => void;
  children: React.ReactNode;
}) {
  return (
    <TableHead
      className="cursor-pointer select-none"
      onClick={() => onSort(column)}
    >
      <span className="flex items-center">
        {children}
        <SortIcon column={column} sortConfig={sortConfig} />
      </span>
    </TableHead>
  );
}

export function getLatestExtension(
  record: AppraisalRecord,
): ExtensionRecord | null {
  if (!record.extension_records || record.extension_records.length === 0) {
    return null;
  }
  return record.extension_records[record.extension_records.length - 1];
}

// Derives which tab a record belongs to — used for client-side tab splitting
export function getMilestoneTab(
  record: AppraisalRecord,
): "third" | "fifth" | "extension" {
  if (record.fifth_month_decision === "EXTENSION") return "extension";
  if (record.third_month_decision === "PROCEED_5TH") return "fifth";
  return "third";
}

// Derives the currently active (pending) milestone for the action panel
export function getActiveMilestone(record: AppraisalRecord): ActiveMilestone {
  if (
    record.appraisal_status === "REGULARIZED" ||
    record.appraisal_status === "NON_REGULARIZED" ||
    record.appraisal_status === "RESOLVED_MANUAL"
  ) {
    return "RESOLVED";
  }
  // Stays "EXTENSION" for as long as ANY extension record is unresolved —
  // works the same whether it's the 1st or the nth extension.
  if (record.fifth_month_decision === "EXTENSION") return "EXTENSION";
  if (record.third_month_decision === "PROCEED_5TH") return "FIFTH_MONTH";
  return "THIRD_MONTH";
}
