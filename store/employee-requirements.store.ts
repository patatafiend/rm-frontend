import { create } from "zustand";
import type { EmployeeRequirement } from "@/lib/types";

export type RequirementStatus = "incomplete" | "completed" | "pending" | "all";
export type DaysSinceHireFilter =
  | "all"
  | "pending-start"
  | "0-15"
  | "15-30"
  | "30+";
export type DocumentFilter = "all" | "provided" | "missing";
export type SortField =
  | "rm_tran_no"
  | "contract_sdate"
  | "emp_status"
  | "erms_id";
export type SortOrder = "asc" | "desc";

export interface RequirementsFilters {
  company: string | null;
  empStatus: string | null;
  reqStatus: RequirementStatus;
  daysSinceHire: DaysSinceHireFilter;
  sssNo: DocumentFilter;
  pagibigNo: DocumentFilter;
  phhealth: DocumentFilter;
  dateRange: { start: string | null; end: string | null };
  searchTerm: string;
}

interface EmployeeRequirementsState {
  // Data
  requirements: EmployeeRequirement[];
  filteredRequirements: EmployeeRequirement[];
  total: number;
  loading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  pageSize: number;
  totalPages: number;

  // Filters & Sorting
  filters: RequirementsFilters;
  sortField: SortField;
  sortOrder: SortOrder;

  // Drawer
  selectedEmployee: EmployeeRequirement | null;

  // Actions
  setRequirements: (data: EmployeeRequirement[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Pagination actions
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter actions
  setCompanyFilter: (company: string | null) => void;
  setEmpStatusFilter: (status: string | null) => void;
  setReqStatusFilter: (status: RequirementStatus) => void;
  setDaysSinceHireFilter: (filter: DaysSinceHireFilter) => void;
  setSssNoFilter: (filter: DocumentFilter) => void;
  setPagibigNoFilter: (filter: DocumentFilter) => void;
  setPhealthFilter: (filter: DocumentFilter) => void;
  setDateRangeFilter: (start: string | null, end: string | null) => void;
  setSearchTerm: (term: string) => void;
  clearFilters: () => void;

  // Sort actions
  setSortField: (field: SortField) => void;
  setSortOrder: (order: SortOrder) => void;

  // Drawer actions
  setSelectedEmployee: (employee: EmployeeRequirement | null) => void;

  // Helper
  applyFiltersAndSort: () => void;
  getUniqueCompanies: () => string[];
  getUniqueEmpStatuses: () => string[];
  getPaginatedData: () => EmployeeRequirement[];
}

const initialFilters: RequirementsFilters = {
  company: null,
  empStatus: null,
  reqStatus: "all",
  daysSinceHire: "all",
  sssNo: "all",
  pagibigNo: "all",
  phhealth: "all",
  dateRange: { start: null, end: null },
  searchTerm: "",
};

// Helper function to deduplicate employees with same rm_tran_no and erms_id
function deduplicateEmployees(
  data: EmployeeRequirement[],
): EmployeeRequirement[] {
  const seen = new Map<string, EmployeeRequirement>();

  for (const employee of data) {
    const key = `${employee.rm_tran_no}-${employee.erms_id}`;

    if (seen.has(key)) {
      // Combine minor_reqs values
      const existing = seen.get(key)!;
      const existingReqs = existing.minor_reqs || "";
      const newReqs = employee.minor_reqs || "";

      // Merge requirements (keep unique values separated by semicolon)
      const combinedReqs = [existingReqs, newReqs]
        .filter(Boolean)
        .filter((req, idx, arr) => arr.indexOf(req) === idx) // Remove duplicates
        .join("; ");

      existing.minor_reqs = combinedReqs;
    } else {
      seen.set(key, { ...employee });
    }
  }

  return Array.from(seen.values());
}

export const useEmployeeRequirementsStore = create<EmployeeRequirementsState>(
  (set, get) => ({
    requirements: [],
    filteredRequirements: [],
    total: 0,
    loading: false,
    error: null,

    currentPage: 1,
    pageSize: 50,
    totalPages: 0,

    filters: initialFilters,
    sortField: "contract_sdate",
    sortOrder: "desc",

    selectedEmployee: null,

    setRequirements: (data) => {
      const { pageSize } = get();
      const deduplicatedData = deduplicateEmployees(data);
      const newTotal = deduplicatedData.length;

      set({
        requirements: deduplicatedData,
        total: newTotal,
        totalPages: Math.ceil(newTotal / pageSize),
        error: null,
        currentPage: 1,
      });
      get().applyFiltersAndSort();
    },

    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),

    setCurrentPage: (page) => set({ currentPage: page }),
    setPageSize: (size) => {
      const { total } = get();
      set({
        pageSize: size,
        totalPages: Math.ceil(total / size),
        currentPage: 1,
      });
      get().applyFiltersAndSort();
    },

    setCompanyFilter: (company) => {
      set((state) => ({ filters: { ...state.filters, company } }));
      get().applyFiltersAndSort();
    },

    setEmpStatusFilter: (status) => {
      set((state) => ({ filters: { ...state.filters, empStatus: status } }));
      get().applyFiltersAndSort();
    },

    setReqStatusFilter: (status) => {
      set((state) => ({ filters: { ...state.filters, reqStatus: status } }));
      get().applyFiltersAndSort();
    },

    setDaysSinceHireFilter: (filter) => {
      set((state) => ({
        filters: { ...state.filters, daysSinceHire: filter },
      }));
      get().applyFiltersAndSort();
    },

    setSssNoFilter: (filter) => {
      set((state) => ({ filters: { ...state.filters, sssNo: filter } }));
      get().applyFiltersAndSort();
    },

    setPagibigNoFilter: (filter) => {
      set((state) => ({ filters: { ...state.filters, pagibigNo: filter } }));
      get().applyFiltersAndSort();
    },

    setPhealthFilter: (filter) => {
      set((state) => ({ filters: { ...state.filters, phhealth: filter } }));
      get().applyFiltersAndSort();
    },

    setDateRangeFilter: (start, end) => {
      set((state) => ({
        filters: { ...state.filters, dateRange: { start, end } },
      }));
      get().applyFiltersAndSort();
    },

    setSearchTerm: (term) => {
      set((state) => ({ filters: { ...state.filters, searchTerm: term } }));
      get().applyFiltersAndSort();
    },

    clearFilters: () => {
      set({ filters: initialFilters });
      get().applyFiltersAndSort();
    },

    setSortField: (field) => {
      set({ sortField: field });
      get().applyFiltersAndSort();
    },

    setSortOrder: (order) => {
      set({ sortOrder: order });
      get().applyFiltersAndSort();
    },

    setSelectedEmployee: (employee) => set({ selectedEmployee: employee }),

    applyFiltersAndSort: () => {
      const { requirements, filters, sortField, sortOrder } = get();

      let filtered = requirements;

      // Company filter
      if (filters.company) {
        filtered = filtered.filter((r) => r.hr_company === filters.company);
      }

      // Employment status filter
      if (filters.empStatus) {
        filtered = filtered.filter((r) => r.emp_status === filters.empStatus);
      }

      // Days since hire filter (handles both past and future hires)
      if (filters.daysSinceHire !== "all") {
        filtered = filtered.filter((r) => {
          const today = new Date();
          const hireDate = new Date(r.contract_sdate);
          const diffTime = today.getTime() - hireDate.getTime();
          const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (filters.daysSinceHire === "pending-start") return daysDiff < 0;
          if (filters.daysSinceHire === "0-15")
            return daysDiff >= 0 && daysDiff <= 15;
          if (filters.daysSinceHire === "15-30")
            return daysDiff > 15 && daysDiff <= 30;
          if (filters.daysSinceHire === "30+") return daysDiff > 30;
          return true;
        });
      }

      // Requirement status filter
      if (filters.reqStatus !== "all") {
        filtered = filtered.filter((r) => {
          const isIncomplete =
            !r.rm_sss_no || !r.rm_pagibig_no || !r.rm_phhealth;

          // Treat `pending` the same as `incomplete` for filtering purposes.
          if (
            filters.reqStatus === "incomplete" ||
            filters.reqStatus === "pending"
          ) {
            return isIncomplete;
          }

          return !isIncomplete;
        });
      }

      // Individual document filters
      if (filters.sssNo !== "all") {
        filtered = filtered.filter((r) => {
          const hasSSS = !!r.rm_sss_no;
          return filters.sssNo === "provided" ? hasSSS : !hasSSS;
        });
      }

      if (filters.pagibigNo !== "all") {
        filtered = filtered.filter((r) => {
          const hasPagibig = !!r.rm_pagibig_no;
          return filters.pagibigNo === "provided" ? hasPagibig : !hasPagibig;
        });
      }

      if (filters.phhealth !== "all") {
        filtered = filtered.filter((r) => {
          const hasPhhealth = !!r.rm_phhealth;
          return filters.phhealth === "provided" ? hasPhhealth : !hasPhhealth;
        });
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        filtered = filtered.filter((r) => {
          const date = new Date(r.contract_sdate);
          if (filters.dateRange.start) {
            const start = new Date(filters.dateRange.start);
            if (date < start) return false;
          }
          if (filters.dateRange.end) {
            const end = new Date(filters.dateRange.end);
            if (date > end) return false;
          }
          return true;
        });
      }

      // Search filter
      if (filters.searchTerm) {
        const term = filters.searchTerm.toLowerCase();
        filtered = filtered.filter(
          (r) =>
            r.rm_first_name.toLowerCase().includes(term) ||
            r.rm_lastname.toLowerCase().includes(term) ||
            r.rm_tran_no.toString().includes(term) ||
            r.erms_id.toString().includes(term) ||
            r.hr_company.toLowerCase().includes(term),
        );
      }

      // Sort
      filtered.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        // Convert to comparable values - handle both strings and numbers
        const aCompare =
          typeof aVal === "string" ? aVal.toLowerCase() : String(aVal ?? "");
        const bCompare =
          typeof bVal === "string" ? bVal.toLowerCase() : String(bVal ?? "");

        if (aCompare < bCompare) return sortOrder === "asc" ? -1 : 1;
        if (aCompare > bCompare) return sortOrder === "asc" ? 1 : -1;
        return 0;
      });

      set({ filteredRequirements: filtered });
    },

    getUniqueCompanies: () => {
      const { requirements } = get();
      return [...new Set(requirements.map((r) => r.hr_company))].sort();
    },

    getUniqueEmpStatuses: () => {
      const { requirements } = get();
      return [...new Set(requirements.map((r) => r.emp_status))].sort();
    },

    getPaginatedData: () => {
      const { filteredRequirements, currentPage, pageSize } = get();
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      return filteredRequirements.slice(startIdx, endIdx);
    },
  }),
);
