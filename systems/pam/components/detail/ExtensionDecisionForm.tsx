"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAppraisalMutations } from "@/systems/pam/hooks/useAppraisals";
import type {
  AppraisalRecord,
  ExtensionDecision,
} from "@/systems/pam/types/appraisal";

export function ExtensionDecisionForm({ record }: { record: AppraisalRecord }) {
  const [decision, setDecision] = useState<ExtensionDecision>(
    record.extension_final_decision ?? "REGULARIZATION",
  );
  const { submitExtension } = useAppraisalMutations(record.rm_tran_no);

  return (
    <form
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        submitExtension.mutate({ decision });
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            Extension Decision
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Close out the extension path once the final decision is ready.
          </p>
        </div>
        <span className="text-xs text-gray-400">
          Current: {record.extension_final_decision ?? "Pending"}
        </span>
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor={`extension-decision-${record.rm_tran_no}`}>
          Decision
        </Label>
        <Select
          value={decision}
          onValueChange={(value) => setDecision(value as ExtensionDecision)}
        >
          <SelectTrigger id={`extension-decision-${record.rm_tran_no}`}>
            <SelectValue placeholder="Select decision" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="REGULARIZATION">Regularization</SelectItem>
            <SelectItem value="NON_REGULARIZATION">
              Non-regularization
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button type="submit" disabled={submitExtension.isPending}>
          {submitExtension.isPending
            ? "Submitting..."
            : "Save Extension Decision"}
        </Button>
      </div>
    </form>
  );
}
