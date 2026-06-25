"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";

const STAGE_COLORS: Record<string, string> = {
  Applicant: "bg-indigo-500",
  "For Medical": "bg-amber-500",
  "For Onboarding": "bg-blue-500",
  Onboarded: "bg-green-500",
};

export function HiringFunnelChart() {
  const { funnelStages } = useAnalyticsStore();

  if (funnelStages.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Applicant Status Distribution</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-gray-400">
          No data
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...funnelStages.map((s) => s.count), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Applicant Status Distribution</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {funnelStages.map((stage) => {
          const widthPct = Math.max(((stage.count / maxCount) * 100), 5);
          const color = STAGE_COLORS[stage.stage] ?? "bg-slate-500";
          return (
            <div key={stage.stage} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-gray-700">{stage.stage}</span>
                <span className="text-gray-500">
                  {stage.count.toLocaleString()}
                  {stage.cumulative_conversion < 1 && (
                    <span className="ml-1.5 text-gray-400">
                      ({(stage.cumulative_conversion * 100).toFixed(1)}% of total)
                    </span>
                  )}
                </span>
              </div>
              <div className="h-7 w-full rounded bg-gray-100 overflow-hidden">
                <div
                  className={`h-full ${color} rounded transition-all duration-500 flex items-center px-2`}
                  style={{ width: `${widthPct}%` }}
                >
                  {/* {stage.conversion_from_prev !== null && (
                    <span className="text-[10px] text-white font-semibold whitespace-nowrap">
                      ↓ {(stage.conversion_from_prev * 100).toFixed(1)}%
                    </span>
                  )} */}
                </div>
              </div>
            </div>
          );
        })}
        <p className="text-[10px] text-gray-400 pt-1">
          Based on current status snapshot — not status transition history.
        </p>
      </CardContent>
    </Card>
  );
}
