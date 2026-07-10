"use client";

import { useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AppraisalBadge, getDaysOverdue } from "./appraisal-badge";
import { useAppraisalStore } from "@/systems/pam/store/appraisals.store";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";
import { cn } from "@/lib/utils";

type DueDateField =
  | "third_month_due_date"
  | "fifth_month_due_date"
  | "extension_until";

interface Props {
  records: AppraisalRecord[];
  dueDateField: DueDateField;
  dueDateLabel: string;
}

const PAGE_SIZE = 10;

type SortKey = "employee" | "company" | "bu" | "dueDate" | "daysOverdue";
type SortDirection = "asc" | "desc";

interface SortConfig {
  key: SortKey;
  direction: SortDirection;
}

function getPageWindows(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>();
  pages.add(1);
  pages.add(total);
  for (let i = Math.max(2, current - 2); i <= Math.min(total - 1, current + 2); i++) {
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

type StatusFilter = "all" | "pending" | "overdue" | "done";

// Declared OUTSIDE AppraisalTable so these aren't recreated (and don't reset
// their identity) on every render. They receive sortConfig/onSort as props
// instead of closing over component-local state.
function SortIcon({ column, sortConfig }: { column: SortKey; sortConfig: SortConfig | null }) {
  if (!sortConfig || sortConfig.key !== column) {
    return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />;
  }
  return sortConfig.direction === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
}

function SortableHead({
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
    <TableHead className="cursor-pointer select-none" onClick={() => onSort(column)}>
      <span className="flex items-center">
        {children}
        <SortIcon column={column} sortConfig={sortConfig} />
      </span>
    </TableHead>
  );
}

export function AppraisalTable({ records, dueDateField, dueDateLabel }: Props) {
  const { setSelectedEmployee } = useAppraisalStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [page, setPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const name = (r.employee_name ?? `${r.rm_lastname} ${r.rm_first_name}`).toLowerCase();
      const matchesSearch =
        !q ||
        name.includes(q) ||
        r.hr_company?.toLowerCase().includes(q) ||
        r.bu_tagging.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;

      const dueRaw = r[dueDateField];
      const hasDecision =
        (dueDateField === "third_month_due_date" && r.third_month_decision) ||
        (dueDateField === "fifth_month_due_date" && r.fifth_month_decision) ||
        (dueDateField === "extension_until" && r.extension_final_decision);

      if (statusFilter === "done") return !!hasDecision;
      if (hasDecision) return false;

      if (dueRaw) {
        const isPast = new Date(dueRaw) < new Date();
        if (statusFilter === "overdue") return isPast;
        if (statusFilter === "pending") return !isPast;
      }
      return statusFilter === "pending";
    });
  }, [records, search, statusFilter, dueDateField]);

  const sorted = useMemo(() => {
    if (!sortConfig) return filtered;

    const { key, direction } = sortConfig;
    const dir = direction === "asc" ? 1 : -1;

    const getValue = (r: AppraisalRecord): string | number => {
      switch (key) {
        case "employee":
          return (
            r.employee_name ?? `${r.rm_lastname ?? ""}, ${r.rm_first_name ?? ""}`
          ).toLowerCase();
        case "company":
          return (r.hr_company ?? "").toLowerCase();
        case "bu":
          return (r.bu_tagging ?? "").toLowerCase();
        case "dueDate": {
          const raw = r[dueDateField];
          return raw ? new Date(raw).getTime() : direction === "asc" ? Infinity : -Infinity;
        }
        case "daysOverdue": {
          const d = getDaysOverdue(r, dueDateField);
          return d ?? (direction === "asc" ? Infinity : -Infinity);
        }
        default:
          return "";
      }
    };

    return [...filtered].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      if (va < vb) return -1 * dir;
      if (va > vb) return 1 * dir;
      return 0;
    });
  }, [filtered, sortConfig, dueDateField]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handleSort(key: SortKey) {
    setSortConfig((prev) => {
      if (!prev || prev.key !== key) return { key, direction: "asc" };
      if (prev.direction === "asc") return { key, direction: "desc" };
      return null; // third click clears sorting
    });
    setPage(1);
  }

  const isTerminal = (r: AppraisalRecord) =>
    ["REGULARIZED", "NON_REGULARIZED", "RESOLVED_MANUAL"].includes(r.appraisal_status);

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex items-center gap-3">
        <Input
          placeholder="Search by name, company, or BU..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="max-w-sm"
        />
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHead column="employee" sortConfig={sortConfig} onSort={handleSort}>
                Employee
              </SortableHead>
              <SortableHead column="company" sortConfig={sortConfig} onSort={handleSort}>
                Company
              </SortableHead>
              <SortableHead column="bu" sortConfig={sortConfig} onSort={handleSort}>
                BU
              </SortableHead>
              <SortableHead column="dueDate" sortConfig={sortConfig} onSort={handleSort}>
                {dueDateLabel}
              </SortableHead>
              <TableHead>Status</TableHead>
              <SortableHead column="daysOverdue" sortConfig={sortConfig} onSort={handleSort}>
                Days Overdue
              </SortableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((record) => {
                const daysOver = getDaysOverdue(record, dueDateField);
                const dueRaw = record[dueDateField];
                const terminal = isTerminal(record);

                return (
                  <TableRow
                    key={record.rm_tran_no}
                    className={cn(
                      "cursor-pointer transition-colors hover:bg-muted/50",
                      terminal && "opacity-50",
                    )}
                    onClick={() => setSelectedEmployee(record)}
                  >
                    <TableCell className="font-medium">
                      {record.employee_name ??
                        `${record.rm_lastname ?? ""}, ${record.rm_first_name ?? ""}`}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {record.hr_company ?? "—"}
                    </TableCell>
                    <TableCell className="text-sm">{record.bu_tagging}</TableCell>
                    <TableCell className="text-sm">
                      {dueRaw ? format(parseISO(dueRaw), "MMM d, yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <AppraisalBadge record={record} dueDateField={dueDateField} />
                    </TableCell>
                    <TableCell className="text-sm text-amber-600">
                      {daysOver ? `${daysOver}d` : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–
          {Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            &lsaquo;
          </Button>
          {getPageWindows(page, totalPages).map((item, i) =>
            item === "..." ? (
              <span key={`ellipsis-${i}`} className="w-8 text-center text-muted-foreground">
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(item)}
                className="w-8"
              >
                {item}
              </Button>
            )
          )}
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            &rsaquo;
          </Button>
        </div>
      </div>
    </div>
  );
}