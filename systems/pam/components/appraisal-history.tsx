"use client";

import { format, formatDistanceToNow, parseISO, differenceInCalendarDays } from "date-fns";
import { Check, Clock, Minus, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { appraisalsApi } from "@/systems/pam/lib/api/appraisals";
import { toast } from "sonner";
import type { AppraisalRecord } from "@/systems/pam/types/appraisal";
import { cn } from "@/lib/utils";

interface Props {
  record: AppraisalRecord;
}

type StepStatus = "done" | "pending" | "inactive";

interface TimelineStep {
  label: string;
  dueDate: string | null | undefined;
  decidedAt: string | null | undefined;
  decisionLabel: string | null;
  fileKey: string | null | undefined;
  status: StepStatus;
}

const DECISION_LABELS: Record<string, string> = {
  PROCEED_5TH: "Proceed to 5th Month",
  NON_REGULARIZATION: "Non-Regularization",
  REGULARIZATION: "Regularize",
  EXTENSION: "Extend Probation",
};

function formatDecision(decision?: string | null): string | null {
  if (!decision) return null;
  return DECISION_LABELS[decision] ?? decision;
}

function dueDateNote(dueRaw?: string | null): string {
  if (!dueRaw) return "";
  const days = differenceInCalendarDays(parseISO(dueRaw), new Date());
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) !== 1 ? "s" : ""} overdue`;
  if (days === 0) return "due today";
  return `due in ${days} day${days !== 1 ? "s" : ""}`;
}

async function openDownloadUrl(rmTranNo: number, fileKey: string) {
  try {
    const { download_url } = await appraisalsApi.getDownloadUrl(rmTranNo, fileKey);
    window.open(download_url, "_blank", "noopener,noreferrer");
  } catch {
    toast.error("Could not retrieve download link.");
  }
}

export function AppraisalHistory({ record }: Props) {
  const thirdDone = !!record.third_month_decision;
  const fifthRelevant = thirdDone;
  const fifthDone = !!record.fifth_month_decision;
  const extensionRelevant = record.fifth_month_decision === "EXTENSION";
  const extensionDone = !!record.extension_final_decision;

  const steps: TimelineStep[] = [
    {
      label: "3rd Month",
      dueDate: record.third_month_due_date,
      decidedAt: record.third_month_decided_at,
      decisionLabel: formatDecision(record.third_month_decision),
      fileKey: record.third_month_appraisal_file_key,
      status: thirdDone ? "done" : "pending",
    },
    {
      label: "5th Month",
      dueDate: record.fifth_month_due_date,
      decidedAt: record.fifth_month_decided_at,
      decisionLabel: formatDecision(record.fifth_month_decision),
      fileKey: record.fifth_month_appraisal_file_key,
      status: !fifthRelevant ? "inactive" : fifthDone ? "done" : "pending",
    },
    {
      label: "Extension",
      dueDate: record.extension_until,
      decidedAt: record.extension_decided_at,
      decisionLabel: formatDecision(record.extension_final_decision),
      fileKey: null,
      status: !extensionRelevant ? "inactive" : extensionDone ? "done" : "pending",
    },
  ];

  return (
    <div className="flex flex-col">
      {steps.map((step, i) => (
        <div key={step.label} className="flex gap-3">
          {/* Icon + connector line */}
          <div className="flex flex-col items-center">
            <StepIcon status={step.status} />
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "mt-1 w-px flex-1",
                  step.status === "inactive" ? "bg-border" : "bg-border",
                )}
                style={{ minHeight: 32 }}
              />
            )}
          </div>

          {/* Content */}
          <div className="pb-6 pt-0.5 flex-1 min-w-0">
            <p
              className={cn(
                "text-sm font-semibold",
                step.status === "inactive" && "text-muted-foreground",
              )}
            >
              {step.label}
              {step.dueDate && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({format(parseISO(step.dueDate), "MMM d, yyyy")})
                </span>
              )}
            </p>

            {step.status === "inactive" && (
              <p className="mt-0.5 text-xs text-muted-foreground">Not yet applicable.</p>
            )}

            {step.status === "pending" && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                No decision yet
                {step.dueDate ? ` · ${dueDateNote(step.dueDate)}` : ""}.
              </p>
            )}

            {step.status === "done" && (
              <div className="mt-1 space-y-1">
                {step.decisionLabel && (
                  <p className="text-xs">
                    <span className="font-medium">Decision:</span> {step.decisionLabel}
                  </p>
                )}
                {step.decidedAt && (
                  <p className="text-xs text-muted-foreground">
                    Submitted{" "}
                    {formatDistanceToNow(parseISO(step.decidedAt), { addSuffix: true })}
                    {" · "}
                    {format(parseISO(step.decidedAt), "MMM d, yyyy")}
                  </p>
                )}
                {step.fileKey && (
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs"
                    onClick={() => openDownloadUrl(record.rm_tran_no, step.fileKey!)}
                  >
                    <Download className="mr-1 h-3 w-3" />
                    Download Appraisal File
                  </Button>
                )}
              </div>
            )}

            {/* Failsafe notice */}
            {i === 2 && record.failsafe_triggered_at && (
              <p className="mt-1 text-xs font-medium text-red-600">
                Fail-safe triggered {format(parseISO(record.failsafe_triggered_at), "MMM d, yyyy")}
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === "done") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
        <Check className="h-3.5 w-3.5" />
      </div>
    );
  }
  if (status === "pending") {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-primary">
        <Clock className="h-3 w-3" />
      </div>
    );
  }
  return (
    <div className="flex h-6 w-6 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
      <Minus className="h-3 w-3" />
    </div>
  );
}