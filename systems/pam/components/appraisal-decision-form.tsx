"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { AppraisalFileUpload } from "./upload/appraisal-upload";
import { useSubmitDecision } from "@/systems/pam/hooks/useSubmitDecision";
import { useAppraisalStore } from "@/systems/pam/store/appraisals.store";
import type {
  ActiveMilestone,
  ThirdMonthDecision,
  FifthMonthDecision,
  ExtensionDecision,
} from "@/systems/pam/types/appraisal";
import { cn } from "@/lib/utils";

interface Props {
  rmTranNo: number;
  milestone: Exclude<ActiveMilestone, "RESOLVED">;
}

export function AppraisalDecisionForm({ rmTranNo, milestone }: Props) {
  const { setDrawerOpen } = useAppraisalStore();
  const { thirdMonth, fifthMonth, extension, isPending } = useSubmitDecision(rmTranNo);

  const [fileKey, setFileKey] = useState<string | null>(null);
  const [thirdDecision, setThirdDecision] = useState<ThirdMonthDecision | null>(null);
  const [fifthDecision, setFifthDecision] = useState<FifthMonthDecision | null>(null);
  const [extDecision, setExtDecision] = useState<ExtensionDecision | null>(null);
  const [extensionUntil, setExtensionUntil] = useState<Date | null>(null);

  const needsFile = milestone !== "EXTENSION";
  const fileReady = !needsFile || !!fileKey;

  const decisionReady =
    (milestone === "THIRD_MONTH" && !!thirdDecision) ||
    (milestone === "FIFTH_MONTH" &&
      !!fifthDecision &&
      (fifthDecision !== "EXTENSION" || !!extensionUntil)) ||
    (milestone === "EXTENSION" && !!extDecision);

  const canSubmit = fileReady && decisionReady && !isPending;

  async function handleSubmit() {
    if (!canSubmit) return;

    if (milestone === "THIRD_MONTH" && thirdDecision && fileKey) {
      await thirdMonth.mutateAsync({ decision: thirdDecision, appraisal_file_key: fileKey });
    } else if (milestone === "FIFTH_MONTH" && fifthDecision && fileKey) {
      await fifthMonth.mutateAsync({
        decision: fifthDecision,
        appraisal_file_key: fileKey,
        ...(fifthDecision === "EXTENSION" && extensionUntil
          ? { extension_until: format(extensionUntil, "yyyy-MM-dd") }
          : {}),
      });
    } else if (milestone === "EXTENSION" && extDecision) {
      await extension.mutateAsync({ decision: extDecision });
    }

    setDrawerOpen(false);
  }

  return (
    <div className="space-y-4">
      <Separator />

      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Action — {milestoneLabel(milestone)}
      </p>

      {/* File upload (not needed for extension final decision) */}
      {needsFile && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">Upload Performance Appraisal</p>
          <AppraisalFileUpload
            rmTranNo={rmTranNo}
            onUploadComplete={(key) => setFileKey(key)}
            onReset={() => setFileKey(null)}
          />
        </div>
      )}

      {/* Decision buttons */}
      <div className="space-y-1.5">
        <p className="text-sm font-medium">Decision</p>

        {milestone === "THIRD_MONTH" && (
          <div className="flex gap-2">
            <DecisionButton
              label="Proceed to 5th Month"
              variant="positive"
              selected={thirdDecision === "PROCEED_5TH"}
              onClick={() => setThirdDecision("PROCEED_5TH")}
            />
            <DecisionButton
              label="Non-Regularization"
              variant="negative"
              selected={thirdDecision === "NON_REGULARIZATION"}
              onClick={() => setThirdDecision("NON_REGULARIZATION")}
            />
          </div>
        )}

        {milestone === "FIFTH_MONTH" && (
          <div className="flex flex-wrap gap-2">
            <DecisionButton
              label="Regularize"
              variant="positive"
              selected={fifthDecision === "REGULARIZATION"}
              onClick={() => { setFifthDecision("REGULARIZATION"); setExtensionUntil(null); }}
            />
            <DecisionButton
              label="Non-Regularization"
              variant="negative"
              selected={fifthDecision === "NON_REGULARIZATION"}
              onClick={() => { setFifthDecision("NON_REGULARIZATION"); setExtensionUntil(null); }}
            />
            <DecisionButton
              label="Extend Probation"
              variant="neutral"
              selected={fifthDecision === "EXTENSION"}
              onClick={() => setFifthDecision("EXTENSION")}
            />
          </div>
        )}

        {milestone === "EXTENSION" && (
          <div className="flex gap-2">
            <DecisionButton
              label="Regularize"
              variant="positive"
              selected={extDecision === "REGULARIZATION"}
              onClick={() => setExtDecision("REGULARIZATION")}
            />
            <DecisionButton
              label="Non-Regularization"
              variant="negative"
              selected={extDecision === "NON_REGULARIZATION"}
              onClick={() => setExtDecision("NON_REGULARIZATION")}
            />
          </div>
        )}
      </div>

      {/* Extension date picker — only when EXTENSION selected on 5th month */}
      {milestone === "FIFTH_MONTH" && fifthDecision === "EXTENSION" && (
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            Extension Until <span className="text-red-500">*</span>
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !extensionUntil && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {extensionUntil ? format(extensionUntil, "MM/dd/yyyy") : "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start" autoFocus>
              <Calendar
                mode="single"
                selected={extensionUntil ?? undefined}
                onSelect={(d) => setExtensionUntil(d ?? null)}
                disabled={(d) => d <= new Date()}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}

      {/* Submit */}
      <Button
        className="w-full"
        disabled={!canSubmit}
        onClick={handleSubmit}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Submitting…
          </>
        ) : (
          "Submit"
        )}
      </Button>
    </div>
  );
}

function milestoneLabel(m: Exclude<ActiveMilestone, "RESOLVED">): string {
  if (m === "THIRD_MONTH") return "3rd Month";
  if (m === "FIFTH_MONTH") return "5th Month";
  return "Extension";
}

interface DecisionButtonProps {
  label: string;
  variant: "positive" | "negative" | "neutral";
  selected: boolean;
  onClick: () => void;
}

function DecisionButton({ label, variant, selected, onClick }: DecisionButtonProps) {
  const base = "flex-1 min-w-fit text-sm border transition-colors";
  const styles: Record<string, string> = {
    positive: selected
      ? "border-green-600 bg-green-600 text-white hover:bg-green-700"
      : "border-green-200 text-green-700 hover:bg-green-50",
    negative: selected
      ? "border-red-600 bg-red-600 text-white hover:bg-red-700"
      : "border-red-200 text-red-700 hover:bg-red-50",
    neutral: selected
      ? "border-amber-500 bg-amber-500 text-white hover:bg-amber-600"
      : "border-amber-200 text-amber-700 hover:bg-amber-50",
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(base, styles[variant])}
      onClick={onClick}
    >
      {label}
    </Button>
  );
}