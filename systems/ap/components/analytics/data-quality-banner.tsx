"use client";

import { AlertTriangle } from "lucide-react";
import type { DataQualityFlags } from "@/systems/ap/lib/api/analytics";

interface Props {
  flags: DataQualityFlags | null;
  funnelNote?: string | null;
  timeMetricsNote?: string | null;
}

export function DataQualityBanner({ flags, funnelNote, timeMetricsNote }: Props) {
  const warnings: string[] = [];

  if (flags) {
    if (flags.duplicate_tran_no_count > 0) {
      warnings.push(`${flags.duplicate_tran_no_count} duplicate transaction numbers detected.`);
    }
    if (flags.missing_encode_date > 0) {
      warnings.push(`${flags.missing_encode_date} rows missing encode date — excluded from trend and time metrics.`);
    }
    if (flags.missing_contract_date > 0) {
      warnings.push(`${flags.missing_contract_date} onboarded rows missing contract date — excluded from time metrics.`);
    }
  }
  if (funnelNote) warnings.push(funnelNote);
  if (timeMetricsNote) warnings.push(timeMetricsNote);

  if (warnings.length === 0) return null;

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <p className="text-xs font-semibold text-amber-800">Data quality notices</p>
          <ul className="space-y-0.5">
            {warnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-700">
                {w}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
