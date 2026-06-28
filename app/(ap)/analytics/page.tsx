"use client";

import { useAnalyticsDashboard, useAnalyticsRefresh, useAnalyticsBuList } from "@/systems/ap/hooks/useAnalytics";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";
import { StatusBarChart } from "@/systems/ap/components/analytics/status-bar-chart";
import { HiringFunnelChart } from "@/systems/ap/components/analytics/hiring-funnel-chart";
import { WeeklyTrendChart } from "@/systems/ap/components/analytics/weekly-trend-chart";
import { TimeMetricsChart } from "@/systems/ap/components/analytics/time-metrics-chart";
import { DataQualityBanner } from "@/systems/ap/components/analytics/data-quality-banner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Users, UserCheck, Clock, RefreshCw } from "lucide-react";

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  color,
  isLoading,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  color: string;
  isLoading: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400">{label}</p>
          {isLoading ? (
            <Skeleton className="mt-2 h-7 w-24 rounded-lg" />
          ) : (
            <p className="mt-1 text-2xl font-bold tracking-tight text-gray-900">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
          )}
          {sub && !isLoading && (
            <p className="mt-0.5 text-xs text-gray-400">{sub}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { isLoading, isRefetching } = useAnalyticsDashboard();
  const { refresh } = useAnalyticsRefresh();
  useAnalyticsBuList();

  const {
    statusCounts,
    timeMetrics,
    timeMetricsNote,
    funnelNote,
    selectedBu,
    buList,
    setSelectedBu,
  } = useAnalyticsStore();

  const totalApplicants = statusCounts.reduce((sum, s) => sum + s.count, 0);
  const onboardedCount = statusCounts.find((s) => s.status === "Onboarded")?.count ?? 0;
  const overallConversion =
    totalApplicants > 0
      ? ((onboardedCount / totalApplicants) * 100).toFixed(1)
      : "—";

  const avgDays =
    timeMetrics.length > 0
      ? Math.round(
          timeMetrics.reduce((sum, t) => sum + (t.mean_days ?? 0), 0) /
            timeMetrics.length
        )
      : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">
            Hiring Pipeline Analytics
          </h1>
          <p className="mt-0.5 text-sm text-gray-400">
            Real-time overview of your recruitment funnel
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* BU Filter */}
          <Select
            value={selectedBu ?? "all"}
            onValueChange={(v) => setSelectedBu(v === "all" ? null : v)}
          >
            <SelectTrigger className="h-8 w-52 text-xs">
              <SelectValue placeholder="All BUs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All BUs</SelectItem>
              {buList.map((bu) => (
                <SelectItem key={bu} value={bu} className="text-xs">
                  {bu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={refresh}
            disabled={isRefetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRefetching ? "animate-spin" : ""}`} />
            {isRefetching ? "Refreshing…" : "Refresh"}
          </Button>
        </div>
      </div>

      {/* Data Quality */}
      <DataQualityBanner
        flags={null}
        funnelNote={funnelNote}
        timeMetricsNote={timeMetricsNote}
      />

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard
          label="Total Applicants"
          value={totalApplicants}
          icon={Users}
          color="bg-indigo-500"
          isLoading={isLoading}
        />
        <KpiCard
          label="Onboarded"
          value={onboardedCount}
          sub={`${overallConversion}% overall conversion`}
          icon={UserCheck}
          color="bg-green-500"
          isLoading={isLoading}
        />
        <KpiCard
          label="Avg Time to Onboard"
          value={avgDays === "—" ? "—" : `${avgDays}d`}
          sub="from application to contract"
          icon={Clock}
          color="bg-amber-500"
          isLoading={isLoading}
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StatusBarChart />
        <HiringFunnelChart />
      </div>

      {/* Charts row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <WeeklyTrendChart />
        <TimeMetricsChart />
      </div>
    </div>
  );
}