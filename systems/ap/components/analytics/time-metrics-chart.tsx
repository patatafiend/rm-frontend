"use client";

import {
  Bar,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  ReferenceLine,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";

const chartConfig: ChartConfig = {
  mean_days: { label: "Mean days", color: "#6366f1" },
  median_days: { label: "Median days", color: "#22c55e" },
  min_days: { label: "Min days", color: "#94a3b8" },
};

export function TimeMetricsChart() {
  const { timeMetrics, timeMetricsNote } = useAnalyticsStore();

  if (timeMetrics.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Time to Onboard</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex h-36 items-center justify-center text-sm text-gray-400">
            No data
          </div>
          {timeMetricsNote && (
            <p className="text-[11px] text-gray-400">{timeMetricsNote}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // Cap Y-axis at 2.5x the mean to keep mean/median visible
  // Show max as a dashed reference line + stat pill instead
  const mean = timeMetrics[0]?.mean_days ?? 0;
  const median = timeMetrics[0]?.median_days ?? 0;
  const min = timeMetrics[0]?.min_days ?? 0;
  const max = timeMetrics[0]?.max_days ?? 0;
  const yAxisMax = Math.ceil(Math.max(mean * 2.5, median * 2.5, 30));

  const chartData = timeMetrics.map((t) => ({
    stage: t.stage,
    mean_days: t.mean_days,
    median_days: t.median_days,
    min_days: t.min_days,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Time to Onboard (days)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Stat pills */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: "Mean",   value: mean,   color: "bg-indigo-100 text-indigo-700" },
            { label: "Median", value: median, color: "bg-green-100 text-green-700" },
            { label: "Min",    value: min,    color: "bg-gray-100 text-gray-600" },
            { label: "Max",    value: max,    color: "bg-amber-100 text-amber-700" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${color}`}
            >
              <span className="text-[10px] font-medium opacity-70">{label}</span>
              <span>{value != null ? `${Math.round(value)}d` : "—"}</span>
            </div>
          ))}
        </div>

        <ChartContainer config={chartConfig} style={{ height: 180 }} className="w-full">
          <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis
              tick={{ fontSize: 11 }}
              width={36}
              domain={[0, yAxisMax]}
              unit="d"
            />
            <Tooltip
              contentStyle={{ fontSize: 12 }}
              formatter={(value) => [value != null ? `${Math.round(Number(value))}d` : "—"]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <ReferenceLine
              y={yAxisMax}
              stroke="#f59e0b"
              strokeDasharray="4 4"
              label={{
                value: `Max: ${Math.round(max)}d`,
                position: "insideTopRight",
                fontSize: 10,
                fill: "#f59e0b",
              }}
            />
            <Bar dataKey="min_days" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Min" />
            <Line
              type="monotone"
              dataKey="mean_days"
              stroke="#6366f1"
              strokeWidth={2}
              name="Mean"
              dot={{ r: 4, fill: "#6366f1" }}
            />
            <Line
              type="monotone"
              dataKey="median_days"
              stroke="#22c55e"
              strokeWidth={2}
              name="Median"
              dot={{ r: 4, fill: "#22c55e" }}
            />
          </ComposedChart>
        </ChartContainer>

        {timeMetricsNote && (
          <p className="text-[10px] text-gray-400">{timeMetricsNote}</p>
        )}
      </CardContent>
    </Card>
  );
}