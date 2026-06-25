"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";

const STATUS_COLORS: Record<string, string> = {
  Applicant: "#6366f1",
  "For Medical": "#f59e0b",
  "For Onboarding": "#3b82f6",
  "Failed Drug test": "#ef4444",
  Onboarded: "#22c55e",
};

const chartConfig: ChartConfig = {
  count: { label: "Count" },
};

export function StatusBarChart() {
  const { statusCounts } = useAnalyticsStore();

  if (statusCounts.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Applicants by Status</CardTitle>
        </CardHeader>
        <CardContent className="flex h-48 items-center justify-center text-sm text-gray-400">
          No data
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Applicants by Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: 220 }} className="w-full">
          <BarChart data={statusCounts} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="status"
              tick={{ fontSize: 11 }}
              angle={-30}
              textAnchor="end"
              interval={0}
            />
            <YAxis tick={{ fontSize: 11 }} width={36} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {statusCounts.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] ?? "#94a3b8"}
                />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
