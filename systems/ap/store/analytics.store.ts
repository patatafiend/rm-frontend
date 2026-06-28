import { create } from "zustand";
import type {
  StatusCount,
  FunnelStage,
  TimeMetric,
  WeeklyTrendPoint,
  RawApplicant,
  DataQualityFlags,
} from "@/systems/ap/lib/api/analytics";

export interface AnalyticsFilters {
  bu: string;
  company: string;
  status: string;
}

interface AnalyticsState {
  // Data
  statusCounts: StatusCount[];
  funnelStages: FunnelStage[];
  timeMetrics: TimeMetric[];
  weeklyTrend: WeeklyTrendPoint[];
  rawData: RawApplicant[];

  // Metadata
  rawTotal: number;
  rawOffset: number;
  rawLimit: number;
  generatedAt: string | null;
  dataQualityFlags: DataQualityFlags | null;
  funnelNote: string | null;
  timeMetricsNote: string | null;

  // Loading / error
  loading: boolean;
  error: string | null;

  // Filters (raw data table)
  filters: AnalyticsFilters;
  setFilter: (key: keyof AnalyticsFilters, value: string) => void;
  resetFilters: () => void;

  // Global BU filter (dashboard)
  selectedBu: string | null;
  buList: string[];
  setSelectedBu: (bu: string | null) => void;
  setBuList: (list: string[]) => void;

  // Pagination
  setPage: (offset: number) => void;

  // Setters (called by hooks)
  setStatusCounts: (data: StatusCount[], meta: { generated_at: string; data_quality_flags: DataQualityFlags }) => void;
  setFunnelStages: (data: FunnelStage[], note?: string) => void;
  setTimeMetrics: (data: TimeMetric[], note?: string) => void;
  setWeeklyTrend: (data: WeeklyTrendPoint[]) => void;
  setRawData: (data: RawApplicant[], total: number, offset: number, limit: number) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  bu: "",
  company: "",
  status: "",
};

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  // Data
  statusCounts: [],
  funnelStages: [],
  timeMetrics: [],
  weeklyTrend: [],
  rawData: [],

  // Metadata
  rawTotal: 0,
  rawOffset: 0,
  rawLimit: 50,
  generatedAt: null,
  dataQualityFlags: null,
  funnelNote: null,
  timeMetricsNote: null,

  // Loading / error
  loading: false,
  error: null,

  // Filters (raw data table)
  filters: DEFAULT_FILTERS,

  setFilter: (key, value) =>
    set((state) => ({
      filters: { ...state.filters, [key]: value },
      rawOffset: 0,
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS, rawOffset: 0 }),

  // Global BU filter (dashboard)
  selectedBu: null,
  buList: [],

  setSelectedBu: (bu) => set({ selectedBu: bu }),
  setBuList: (list) => set({ buList: list }),

  // Pagination
  setPage: (offset) => set({ rawOffset: offset }),

  // Setters
  setStatusCounts: (data, meta) =>
    set({
      statusCounts: data,
      generatedAt: meta.generated_at,
      dataQualityFlags: meta.data_quality_flags,
    }),

  setFunnelStages: (data, note) => set({ funnelStages: data, funnelNote: note ?? null }),

  setTimeMetrics: (data, note) => set({ timeMetrics: data, timeMetricsNote: note ?? null }),

  setWeeklyTrend: (data) => set({ weeklyTrend: data }),

  setRawData: (data, total, offset, limit) =>
    set({ rawData: data, rawTotal: total, rawOffset: offset, rawLimit: limit }),

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));