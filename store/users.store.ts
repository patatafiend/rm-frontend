import { create } from "zustand";
import type { UsersListResponse, UserSummary } from "@/lib/types";

export type BlockedFilter = "all" | "active" | "blocked";
export type AccountTypeFilter = "all" | string;

export interface UsersFilters {
  search: string;
  accountType: AccountTypeFilter;
  blocked: BlockedFilter;
}

interface UsersState {
  items: UserSummary[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  loading: boolean;
  error: string | null;
  filters: UsersFilters;
  roleMap: Record<number, string>;

  setUsers: (payload: UsersListResponse) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSearchTerm: (term: string) => void;
  setAccountType: (accountType: AccountTypeFilter) => void;
  setBlockedFilter: (blocked: BlockedFilter) => void;
  clearFilters: () => void;
  setRoleMap: (map: Record<number, string>) => void;
  getQueryParams: () => {
    page: number;
    page_size: number;
    account_type?: string;
    is_blocked?: boolean;
    search?: string;
  };
}

const initialFilters: UsersFilters = {
  search: "",
  accountType: "all",
  blocked: "all",
};

function buildTotalPages(total: number, pageSize: number) {
  if (total <= 0 || pageSize <= 0) return 0;
  return Math.ceil(total / pageSize);
}

export const useUsersStore = create<UsersState>((set, get) => ({
  items: [],
  total: 0,
  page: 1,
  pageSize: 20,
  totalPages: 0,
  loading: false,
  error: null,
  filters: initialFilters,
  roleMap: {},

  setUsers: (payload) => {
    set({
      items: payload.items,
      total: payload.total,
      page: payload.page,
      pageSize: payload.page_size,
      totalPages: buildTotalPages(payload.total, payload.page_size),
      error: null,
    });
  },

  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  setPage: (page) => set({ page }),
  setPageSize: (size) => {
    const total = get().total;
    set({ pageSize: size, page: 1, totalPages: buildTotalPages(total, size) });
  },

  setSearchTerm: (term) =>
    set((state) => ({
      filters: { ...state.filters, search: term },
      page: 1,
    })),

  setAccountType: (accountType) =>
    set((state) => ({
      filters: { ...state.filters, accountType },
      page: 1,
    })),

  setBlockedFilter: (blocked) =>
    set((state) => ({ filters: { ...state.filters, blocked }, page: 1 })),

  clearFilters: () =>
    set({
      filters: initialFilters,
      page: 1,
    }),

  setRoleMap: (map) => set({ roleMap: map }),

  getQueryParams: () => {
    const { page, pageSize, filters } = get();
    const search = filters.search.trim();

    return {
      page,
      page_size: pageSize,
      account_type: filters.accountType !== "all" ? filters.accountType : undefined,
      is_blocked:
        filters.blocked === "all"
          ? undefined
          : filters.blocked === "blocked",
      search: search.length > 0 ? search : undefined,
    };
  },
}));
