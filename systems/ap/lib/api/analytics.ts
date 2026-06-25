import { apiClient } from "./client";

export interface DataQualityFlags {
  missing_encode_date: number;
  missing_contract_date: number;
  duplicate_tran_no_count: number;
  invalid_status_count: number;
  total_filtered: number;
}

export interface AnalyticsMeta {
  filtered_count: number;
  generated_at: string;
  data_quality_flags: DataQualityFlags;
  total?: number;
  limit?: number;
  offset?: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversion_from_prev: number | null;
  cumulative_conversion: number;
}

export interface TimeMetric {
  stage: string;
  sample_size: number;
  mean_days: number | null;
  median_days: number | null;
  min_days: number | null;
  max_days: number | null;
}

export interface WeeklyTrendPoint {
  iso_week: string;
  count: number;
}

export interface RawApplicant {
  rm_tran_no: number;
  rm_encode_date: string | null;
  rm_first_name: string;
  rm_middle_name: string;
  rm_other_name: string;
  rm_pos_applied: string;
  hr_company: string;
  area: string;
  Job_industry: string;
  rm_job_status: string;
  admin_condate: string | null;
  bu_tagging: string;
  erms_id: number;
}

export interface AnalyticsResponse<T> {
  meta: AnalyticsMeta;
  data: T[];
  note?: string;
}

export interface RawParams {
  limit?: number;
  offset?: number;
  bu?: string;
  company?: string;
  status?: string;
  refresh?: boolean;
}

export const analyticsApi = {
  statusCounts: async (refresh = false): Promise<AnalyticsResponse<StatusCount>> => {
    const { data } = await apiClient.get("/analytics/status-counts", {
      params: { refresh },
    });
    return data;
  },

  funnel: async (refresh = false): Promise<AnalyticsResponse<FunnelStage>> => {
    const { data } = await apiClient.get("/analytics/funnel", {
      params: { refresh },
    });
    return data;
  },

  timeMetrics: async (refresh = false): Promise<AnalyticsResponse<TimeMetric>> => {
    const { data } = await apiClient.get("/analytics/time-metrics", {
      params: { refresh },
    });
    return data;
  },

  weeklyTrend: async (weeks = 12, refresh = false): Promise<AnalyticsResponse<WeeklyTrendPoint>> => {
    const { data } = await apiClient.get("/analytics/weekly-trend", {
      params: { weeks, refresh },
    });
    return data;
  },

  raw: async (params: RawParams = {}): Promise<AnalyticsResponse<RawApplicant>> => {
    const { data } = await apiClient.get("/analytics/raw", { params });
    return data;
  },
};
