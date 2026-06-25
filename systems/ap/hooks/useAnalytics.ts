import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { analyticsApi } from "@/systems/ap/lib/api/analytics";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";
import { useAuthStore } from "@/store/auth.store";

const STALE_TIME = 5 * 60 * 1000; // 5 minutes — matches backend TTL

export function useAnalyticsDashboard(refresh = false) {
  const { accessToken } = useAuthStore();
  const {
    setStatusCounts,
    setFunnelStages,
    setTimeMetrics,
    setWeeklyTrend,
    setLoading,
    setError,
  } = useAnalyticsStore();

  const statusQuery = useQuery({
    queryKey: ["ap", "status-counts", accessToken, refresh],
    queryFn: async () => {
      const res = await analyticsApi.statusCounts(refresh);
      setStatusCounts(res.data, res.meta);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  const funnelQuery = useQuery({
    queryKey: ["ap", "funnel", accessToken, refresh],
    queryFn: async () => {
      const res = await analyticsApi.funnel(refresh);
      setFunnelStages(res.data, res.note);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  const timeQuery = useQuery({
    queryKey: ["ap", "time-metrics", accessToken, refresh],
    queryFn: async () => {
      const res = await analyticsApi.timeMetrics(refresh);
      setTimeMetrics(res.data, res.note);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  const trendQuery = useQuery({
    queryKey: ["ap", "weekly-trend", accessToken, refresh],
    queryFn: async () => {
      const res = await analyticsApi.weeklyTrend(12, refresh);
      setWeeklyTrend(res.data);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  const isLoading =
    statusQuery.isLoading ||
    funnelQuery.isLoading ||
    timeQuery.isLoading ||
    trendQuery.isLoading;

  const isRefetching =
    statusQuery.isRefetching ||
    funnelQuery.isRefetching ||
    timeQuery.isRefetching ||
    trendQuery.isRefetching;

  const error =
    statusQuery.error ||
    funnelQuery.error ||
    timeQuery.error ||
    trendQuery.error;

  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (error) {
      const msg = error instanceof Error ? error.message : "Failed to load analytics";
      setError(msg);
      toast.error(msg);
    } else {
      setError(null);
    }
  }, [error, setError]);

  return { isLoading, isRefetching, error };
}

export function useAnalyticsRaw() {
  const { accessToken } = useAuthStore();
  const { filters, rawOffset, rawLimit, setRawData, setLoading, setError } =
    useAnalyticsStore();

  const query = useQuery({
    queryKey: [
      "ap",
      "raw",
      accessToken,
      filters.bu,
      filters.company,
      filters.status,
      rawOffset,
      rawLimit,
    ],
    queryFn: async () => {
      const res = await analyticsApi.raw({
        limit: rawLimit,
        offset: rawOffset,
        bu: filters.bu || undefined,
        company: filters.company || undefined,
        status: filters.status || undefined,
      });
      setRawData(res.data, res.meta.total ?? res.meta.filtered_count, rawOffset, rawLimit);
      return res;
    },
    staleTime: STALE_TIME,
    enabled: !!accessToken,
  });

  useEffect(() => {
    setLoading(query.isLoading);
  }, [query.isLoading, setLoading]);

  useEffect(() => {
    if (query.error) {
      const msg = query.error instanceof Error ? query.error.message : "Failed to load raw data";
      setError(msg);
      toast.error(msg);
    }
  }, [query.error, setError]);

  return query;
}

export function useAnalyticsRefresh() {
  const queryClient = useQueryClient();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["ap"] });
  };

  return { refresh };
}