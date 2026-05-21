"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, X, SlidersHorizontal } from "lucide-react";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { useEmployeeRequirements } from "@/hooks/admin/useEmployeeRequirements";
import type {
  DaysSinceHireFilter,
  DocumentFilter,
} from "@/store/employee-requirements.store";
import { RefreshCcw } from "lucide-react";

export function EmployeeRequirementsFilters() {
  const {
    filters,
    setCompanyFilter,
    setEmpStatusFilter,
    setReqStatusFilter,
    setDaysSinceHireFilter,
    setSssNoFilter,
    setPagibigNoFilter,
    setPhealthFilter,
    setDateRangeFilter,
    setSearchTerm,
    clearFilters,
    getUniqueCompanies,
    getUniqueEmpStatuses,
  } = useEmployeeRequirementsStore();

  const companies = getUniqueCompanies();
  const statuses = getUniqueEmpStatuses();
  const { refetch, isRefetching } = useEmployeeRequirements();

  const hasActiveFilters =
    filters.searchTerm ||
    filters.company ||
    filters.empStatus ||
    filters.reqStatus !== "all" ||
    filters.daysSinceHire !== "all" ||
    filters.sssNo !== "all" ||
    filters.pagibigNo !== "all" ||
    filters.phhealth !== "all" ||
    filters.dateRange.start ||
    filters.dateRange.end;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          Filters
        </div>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isRefetching}
            className="h-7 px-2.5 text-xs text-gray-500 hover:text-gray-900 hover:bg-gray-100 gap-1.5 transition-colors mr-2"
          >
            <RefreshCcw className="w-4 h-4" />
            {isRefetching ? "Refreshing..." : "Refresh"}
          </Button>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2.5 text-xs text-gray-500 hover:text-red-500 hover:bg-red-50 gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Filter Body */}
      <div className="px-5 py-4 space-y-4">
        {/* Search — full width */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by name, ERMS ID, transaction no., company…"
            value={filters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>

        {/* Dropdowns row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <FilterField label="Company">
            <Select
              value={filters.company || "all"}
              onValueChange={(val) =>
                setCompanyFilter(val === "all" ? null : val)
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Companies" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Companies</SelectItem>
                {companies.map((company) => (
                  <SelectItem key={company} value={company}>
                    {company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Employment Status">
            <Select
              value={filters.empStatus || "all"}
              onValueChange={(val) =>
                setEmpStatusFilter(val === "all" ? null : val)
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Requirement Status">
            <Select
              value={filters.reqStatus}
              onValueChange={(val) =>
                setReqStatusFilter(val as "incomplete" | "completed" | "all")
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Days Since Hire">
            <Select
              value={filters.daysSinceHire}
              onValueChange={(val) =>
                setDaysSinceHireFilter(val as DaysSinceHireFilter)
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending-start">Pending Start</SelectItem>
                <SelectItem value="0-15">0-15 Days</SelectItem>
                <SelectItem value="15-30">15-30 Days</SelectItem>
                <SelectItem value="30+">30+ Days</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="SSS">
            <Select
              value={filters.sssNo}
              onValueChange={(val) => setSssNoFilter(val as DocumentFilter)}
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="provided">Provided</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Pagibig">
            <Select
              value={filters.pagibigNo}
              onValueChange={(val) => setPagibigNoFilter(val as DocumentFilter)}
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="provided">Provided</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="PhHealth">
            <Select
              value={filters.phhealth}
              onValueChange={(val) => setPhealthFilter(val as DocumentFilter)}
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="provided">Provided</SelectItem>
                <SelectItem value="missing">Missing</SelectItem>
              </SelectContent>
            </Select>
          </FilterField>
        </div>

        {/* Date range row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FilterField label="Contract Start - From">
            <Input
              type="date"
              value={filters.dateRange.start || ""}
              onChange={(e) =>
                setDateRangeFilter(
                  e.target.value || null,
                  filters.dateRange.end,
                )
              }
              className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </FilterField>

          <FilterField label="Contract Start - To">
            <Input
              type="date"
              value={filters.dateRange.end || ""}
              onChange={(e) =>
                setDateRangeFilter(
                  filters.dateRange.start,
                  e.target.value || null,
                )
              }
              className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </FilterField>
        </div>
      </div>
    </div>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </label>
      {children}
    </div>
  );
}
