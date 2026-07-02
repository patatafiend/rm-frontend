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
  ThirdMonthDecision,
} from "@/systems/pam/types/appraisal";

export function ThirdMonthForm({
  record,
  defaultFileKey,
}: {
  record: AppraisalRecord;
  defaultFileKey?: string;
}) {
  const [decision, setDecision] = useState<ThirdMonthDecision>(
    record.third_month_decision ?? "PROCEED_5TH",
  );
  const [fileKey, setFileKey] = useState(defaultFileKey ?? "");
  const { submitThird } = useAppraisalMutations(record.rm_tran_no);

  return (
    <form
      className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        submitThird.mutate({ decision, appraisal_file_key: fileKey.trim() });
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900">
            3rd Month Decision
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Submit the 3rd month assessment and attach the appraisal file key.
          </p>
        </div>
        <span className="text-xs text-gray-400">
          Current: {record.third_month_decision ?? "Pending"}
        </span>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor={`third-decision-${record.rm_tran_no}`}>
            Decision
          </Label>
          <Select
            value={decision}
            onValueChange={(value) => setDecision(value as ThirdMonthDecision)}
          >
            <SelectTrigger id={`third-decision-${record.rm_tran_no}`}>
              <SelectValue placeholder="Select decision" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PROCEED_5TH">Proceed to 5th month</SelectItem>
              <SelectItem value="NON_REGULARIZATION">
                Non-regularization
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`third-file-${record.rm_tran_no}`}>
            Appraisal file key
          </Label>
          <Input
            id={`third-file-${record.rm_tran_no}`}
            value={fileKey}
            onChange={(event) => setFileKey(event.target.value)}
            placeholder="appraisals/record-123.pdf"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end gap-3">
        <Button
          type="submit"
          disabled={submitThird.isPending || !fileKey.trim()}
        >
          {submitThird.isPending ? "Submitting..." : "Submit 3rd Month"}
        </Button>
      </div>
    </form>
  );
}
