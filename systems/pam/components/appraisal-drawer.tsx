"use client";


import { formatDistanceStrict, parseISO } from "date-fns";
import { X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AppraisalHistory } from "./appraisal-history";
import { AppraisalDecisionForm } from "./appraisal-decision-form";
import { useAppraisalStore } from "@/systems/pam/store/appraisals.store";
import { useAppraisalDetail } from "@/systems/pam/hooks/useAppraisalDetail";
import { getActiveMilestone } from "@/systems/pam/types/appraisal";

export function AppraisalDrawer() {
  const { selectedEmployee, drawerOpen, setDrawerOpen } = useAppraisalStore();

  const rmTranNo = selectedEmployee?.rm_tran_no ?? null;
  const { data: record, isLoading } = useAppraisalDetail(rmTranNo);

  // Merge list record (has basic fields) with detail record (has file keys + decided_at)
  const display = record ?? selectedEmployee;

  const activeMilestone = display ? getActiveMilestone(display) : null;

  const isTerminal =
    display?.appraisal_status === "REGULARIZED" ||
    display?.appraisal_status === "NON_REGULARIZED" ||
    display?.appraisal_status === "RESOLVED_MANUAL" ||
    display?.appraisal_status === "FOR_REGULARIZATION";

  // Narrowed type — only set when there is genuinely an actionable milestone
  const actionableMilestone =
    !isTerminal &&
    activeMilestone !== null &&
    activeMilestone !== "RESOLVED"
      ? activeMilestone
      : null;

  const employeeName =
    display?.employee_name ??
    [display?.rm_lastname, display?.rm_first_name].filter(Boolean).join(", ");

  const tenure = display?.contract_sdate
    ? formatDistanceStrict(parseISO(display.contract_sdate), new Date(), {
        addSuffix: false,
      })
    : null;

  return (
    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent
        side="right"
        className="flex w-full max-w-md flex-col gap-0 overflow-y-auto p-0 sm:max-w-lg"
      >
        {/* Header */}
        <SheetHeader className="flex flex-row items-center justify-between border-b px-5 py-4">
          <SheetTitle className="text-base font-semibold">
            {employeeName || "Appraisal Detail"}
          </SheetTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0"
            onClick={() => setDrawerOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </SheetHeader>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* Section A — Employee info */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Employee Information
            </p>
            {isLoading && !display ? (
              <InfoSkeleton />
            ) : display ? (
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
                <InfoRow label="Name" value={employeeName} />
                <InfoRow label="Company" value={display.hr_company} />
                <InfoRow label="Client" value={display.hr_client} />
                <InfoRow label="Position" value={display.rm_pos_applied} />
                <InfoRow label="BU" value={display.bu_tagging} />
                <InfoRow
                  label="Contract Start"
                  value={
                    display.contract_sdate
                      ? new Date(display.contract_sdate).toLocaleDateString("en-PH", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : undefined
                  }
                />
                <InfoRow
                  label="Months Employed"
                  value={tenure ?? undefined}
                />
              </dl>
            ) : null}
          </section>

          <Separator />

          {/* Section B — Appraisal history */}
          <section>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Appraisal History
            </p>
            {isLoading && !display ? (
              <HistorySkeleton />
            ) : display ? (
              <AppraisalHistory record={display} />
            ) : null}
          </section>

          {/* Section C — Action panel */}
          {display && actionableMilestone && (
            <AppraisalDecisionForm
              rmTranNo={display.rm_tran_no}
              milestone={actionableMilestone}
            />
          )}

          {/* FOR_REGULARIZATION notice */}
          {display?.appraisal_status === "FOR_REGULARIZATION" && (
            <>
              <Separator />
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700">
                <p className="font-semibold">Fail-safe Triggered</p>
                <p className="mt-0.5">
                  This employee has been automatically flagged for regularization.
                  No further action is available in PAM.
                </p>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <>
      <dt className="font-medium text-muted-foreground">{label}</dt>
      <dd className="text-foreground">{value ?? "—"}</dd>
    </>
  );
}

function InfoSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
    </div>
  );
}

function HistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}