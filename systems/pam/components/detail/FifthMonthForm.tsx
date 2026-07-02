"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  FifthMonthDecision,
} from "@/systems/pam/types/appraisal";

export function FifthMonthForm({
  record,
  defaultFileKey,
}: {
  record: AppraisalRecord;
  defaultFileKey?: string;
}) {
  const [decision, setDecision] = useState<FifthMonthDecision>(
    record.fifth_month_decision ?? "REGULARIZATION",
  );
  const [fileKey, setFileKey] = useState(defaultFileKey ?? "");
  const [extensionUntil, setExtensionUntil] = useState(
    record.extension_until ?? "",
  );
  const { submitFifth } = useAppraisalMutations(record.rm_tran_no);

  return (
    <form
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        submitFifth.mutate({
          decision,
          appraisal_file_key: fileKey.trim(),
          extension_until: extensionUntil.trim() || undefined,
        });
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            5th Month Decision
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Record the final 5th month outcome or queue an extension.
          </p>
        </div>
        <span className="text-xs text-gray-400">
          Current: {record.fifth_month_decision ?? "Pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`fifth-decision-${record.rm_tran_no}`}>
            Decision
          </Label>
          <Select
            value={decision}
            onValueChange={(value) => setDecision(value as FifthMonthDecision)}
          >
            <SelectTrigger id={`fifth-decision-${record.rm_tran_no}`}>
              <SelectValue placeholder="Select decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REGULARIZATION">Regularization</SelectItem>
              <SelectItem value="NON_REGULARIZATION">
                Non-regularization
              </SelectItem>
              <SelectItem value="EXTENSION">Extension</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`fifth-file-${record.rm_tran_no}`}>
            Appraisal file key
          </Label>
          <Input
            id={`fifth-file-${record.rm_tran_no}`}
            value={fileKey}
            onChange={(event) => setFileKey(event.target.value)}
            placeholder="appraisals/record-123.pdf"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`extension-until-${record.rm_tran_no}`}>
            Extension until
          </Label>
          <Input
            id={`extension-until-${record.rm_tran_no}`}
            type="date"
            value={extensionUntil}
            onChange={(event) => setExtensionUntil(event.target.value)}
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={submitFifth.isPending || !fileKey.trim()}
        >
          {submitFifth.isPending ? "Submitting..." : "Submit 5th Month"}
        </Button>
      </div>
    </form>
  );
}
