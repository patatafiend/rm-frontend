import { create } from "zustand";
import type { EmployeeRequirement } from "@/lib/types";
import {
  ProcessedEmployee,
  MinorReqStatusCache,
} from "@/lib/utils/requirements";

export type RequirementStatus = "incomplete" | "completed" | "pending" | "all";
export type DaysSinceHireFilter =
  | "all"
  | "pending-start"
  | "0-15"
  | "15-30"
  | "30+";
export type DocumentFilter = "all" | "provided" | "missing";
export type MinorReqCompleteness = "complete" | "incomplete" | "all";
export type SortField =
  | "rm_tran_no"
  | "contract_sdate"
  | "emp_status"
  | "erms_id";
export type SortOrder = "asc" | "desc";

export interface RequirementsFilters {
  company: string | null;
  empStatus: string | null;
  businessUnit: string | null;
  reqStatus: RequirementStatus;
  daysSinceHire: DaysSinceHireFilter;
  sssNo: DocumentFilter;
  pagibigNo: DocumentFilter;
  phhealth: DocumentFilter;
  dateRange: { start: string | null; end: string | null };
  searchTerm: string;
  minorReqCompleteness: MinorReqCompleteness;
  minorReqSpecific: string | null;
}

interface EmployeeRequirementsState {
  // Data
  requirements: ProcessedEmployee[];
  filteredRequirements: ProcessedEmployee[];
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

  // Internal cache for requirement status (for performance)
  reqStatusCache: MinorReqStatusCache;

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
  setBusinessUnitFilter: (unit: string | null) => void;
  setReqStatusFilter: (status: RequirementStatus) => void;
  setDaysSinceHireFilter: (filter: DaysSinceHireFilter) => void;
  setSssNoFilter: (filter: DocumentFilter) => void;
  setPagibigNoFilter: (filter: DocumentFilter) => void;
  setPhealthFilter: (filter: DocumentFilter) => void;
  setDateRangeFilter: (start: string | null, end: string | null) => void;
  setSearchTerm: (term: string) => void;
  setMinorReqCompletenessFilter: (filter: MinorReqCompleteness) => void;
  setMinorReqSpecificFilter: (req: string | null) => void;
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
  getUniqueBusinessUnits: () => string[];
  getPaginatedData: () => EmployeeRequirement[];
}

const initialFilters: RequirementsFilters = {
  company: null,
  empStatus: null,
  businessUnit: null,
  reqStatus: "all",
  daysSinceHire: "all",
  sssNo: "all",
  pagibigNo: "all",
  phhealth: "all",
  dateRange: { start: null, end: null },
  searchTerm: "",
  minorReqCompleteness: "all",
  minorReqSpecific: null,
};

function deduplicateEmployees(
  data: EmployeeRequirement[],
): ProcessedEmployee[] {
  const seen = new Map<string, ProcessedEmployee>();

  for (const employee of data) {
    const key = `${employee.rm_tran_no}-${employee.erms_id}`;

    if (seen.has(key)) {
      const existing = seen.get(key)!;
      const existingReqs = existing.minor_reqs || "";
      const newReqs = employee.minor_reqs || "";

      const combinedReqs = [existingReqs, newReqs]
        .filter(Boolean)
        .filter((req, idx, arr) => arr.indexOf(req) === idx)
        .join("; ");

      existing.minor_reqs = combinedReqs;
      // Update the parsed list
      existing.minor_reqs_list = combinedReqs
        .split("; ")
        .map((r) => r.trim())
        .filter((r) => r !== "");
    } else {
      const processedEmployee: ProcessedEmployee = {
        ...employee,
        minor_reqs_list: (employee.minor_reqs || "")
          .split("; ")
          .map((r) => r.trim())
          .filter((r) => r !== ""),
      };
      seen.set(key, processedEmployee);
    }
  }

  return Array.from(seen.values());
}

function isShortTermEmployee(employee: EmployeeRequirement): boolean {
  return employee.emp_status.trim().toUpperCase() === "SHORT TERM";
}

export const useEmployeeRequirementsStore = create<EmployeeRequirementsState>(
  (set, get) => ({
    requirements: [],
    filteredRequirements: [],
    total: 0,
    loading: false,
    error: null,

    currentPage: 1,
    pageSize: 10,
    totalPages: 0,

    filters: initialFilters,
    sortField: "contract_sdate",
    sortOrder: "desc",

    selectedEmployee: null,
    reqStatusCache: new MinorReqStatusCache(),

    setRequirements: (data) => {
      const { pageSize, reqStatusCache } = get();
      const filteredData = data.filter(
        (employee) => !isShortTermEmployee(employee),
      );
      const deduplicatedData = deduplicateEmployees(filteredData);
      const newTotal = deduplicatedData.length;

      // Clear cache on new data
      reqStatusCache.clear();

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

    setBusinessUnitFilter: (unit) => {
      set((state) => ({ filters: { ...state.filters, businessUnit: unit } }));
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

    setMinorReqCompletenessFilter: (filter) => {
      set((state) => ({
        filters: { ...state.filters, minorReqCompleteness: filter },
      }));
      get().applyFiltersAndSort();
    },

    setMinorReqSpecificFilter: (req) => {
      set((state) => ({
        filters: { ...state.filters, minorReqSpecific: req },
      }));
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

      if (filters.company) {
        filtered = filtered.filter((r) => r.hr_company === filters.company);
      }

      if (filters.empStatus) {
        filtered = filtered.filter((r) => r.emp_status === filters.empStatus);
      }

      if (filters.businessUnit) {
        filtered = filtered.filter(
          (r) => r.bu_tagging === filters.businessUnit,
        );
      }

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

      if (filters.reqStatus !== "all") {
        filtered = filtered.filter((r) => {
          const isIncomplete =
            !r.rm_sss_no || !r.rm_pagibig_no || !r.rm_phhealth;

          if (
            filters.reqStatus === "incomplete" ||
            filters.reqStatus === "pending"
          ) {
            return isIncomplete;
          }

          return !isIncomplete;
        });
      }

      // Filter by minor requirement completeness (universal requirements)
      if (filters.minorReqCompleteness !== "all") {
        const { reqStatusCache } = get();
        filtered = filtered.filter((r) => {
          const status = reqStatusCache.get(r);
          if (filters.minorReqCompleteness === "complete") {
            return status.complete;
          } else if (filters.minorReqCompleteness === "incomplete") {
            return !status.complete;
          }
          return true;
        });
      }

      // Filter by specific missing requirement
      if (filters.minorReqSpecific) {
        const { reqStatusCache } = get();
        filtered = filtered.filter((r) => {
          const status = reqStatusCache.get(r);
          return status.missing.includes(filters.minorReqSpecific!);
        });
      }

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

    getUniqueBusinessUnits: () => {
      const { requirements } = get();
      return [...new Set(requirements.map((r) => r.bu_tagging))]
        .filter(Boolean)
        .sort();
    },

    getUniqueMinorReqs: () => {
      const { requirements } = get();
      const allMinorReqs = requirements
        .flatMap((r) => (r.minor_reqs ? r.minor_reqs.split("; ") : []))
        .filter((req) => req.trim() !== "")
        .map((req) => req.trim());
      return [...new Set(allMinorReqs)].sort();
    },

    getPaginatedData: () => {
      const { filteredRequirements, currentPage, pageSize } = get();
      const startIdx = (currentPage - 1) * pageSize;
      const endIdx = startIdx + pageSize;
      return filteredRequirements.slice(startIdx, endIdx);
    },
  }),
);
