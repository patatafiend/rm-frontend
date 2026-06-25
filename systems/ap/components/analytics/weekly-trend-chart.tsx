"use client";

import {
  Line,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";

const chartConfig: ChartConfig = {
  count: { label: "Entries", color: "#6366f1" },
};

export function WeeklyTrendChart() {
  const { weeklyTrend } = useAnalyticsStore();

  if (weeklyTrend.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Weekly Pipeline Entries</CardTitle>
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
        <CardTitle className="text-base">Weekly Pipeline Entries</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} style={{ height: 200 }} className="w-full">
          <LineChart data={weeklyTrend} margin={{ top: 4, right: 8, left: 0, bottom: 40 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis
              dataKey="iso_week"
              tick={{ fontSize: 10 }}
              angle={-40}
              textAnchor="end"
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 11 }} width={36} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="count"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
