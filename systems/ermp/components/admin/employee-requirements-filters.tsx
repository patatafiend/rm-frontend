"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  Search,
  X,
  SlidersHorizontal,
  RefreshCcw,
} from "lucide-react";
import { type DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeRequirementsStore } from "@/systems/ermp/store/employee-requirements.store";
import { useEmployeeRequirements } from "@/systems/ermp/hooks/admin/useEmployeeRequirements";
import type {
  DaysSinceHireFilter,
  DocumentFilter,
  MinorReqCompleteness,
} from "@/systems/ermp/store/employee-requirements.store";

export function EmployeeRequirementsFilters() {
  const {
    filters,
    setCompanyFilter,
    setEmpStatusFilter,
    setBusinessUnitFilter,
    setReqStatusFilter,
    setDaysSinceHireFilter,
    setSssNoFilter,
    setPagibigNoFilter,
    setPhealthFilter,
    setDateRangeFilter,
    setSearchTerm,
    setMinorReqCompletenessFilter,
    clearFilters,
    getUniqueCompanies,
    getUniqueEmpStatuses,
    getUniqueBusinessUnits,
  } = useEmployeeRequirementsStore();

  const companies = getUniqueCompanies();
  const statuses = getUniqueEmpStatuses();
  const businessUnits = getUniqueBusinessUnits();
  const { refetch, isRefetching } = useEmployeeRequirements();

  const dateRange: DateRange | undefined =
    filters.dateRange.start || filters.dateRange.end
      ? {
          from: filters.dateRange.start
            ? new Date(filters.dateRange.start)
            : undefined,
          to: filters.dateRange.end
            ? new Date(filters.dateRange.end)
            : undefined,
        }
      : undefined;

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    setDateRangeFilter(
      range?.from ? format(range.from, "yyyy-MM-dd") : null,
      range?.to ? format(range.to, "yyyy-MM-dd") : null,
    );
  };

  const hasActiveFilters =
    filters.searchTerm ||
    filters.company ||
    filters.empStatus ||
    filters.businessUnit ||
    filters.reqStatus !== "all" ||
    filters.daysSinceHire !== "all" ||
    filters.sssNo !== "all" ||
    filters.pagibigNo !== "all" ||
    filters.phhealth !== "all" ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.minorReqCompleteness !== "all" ||
    filters.minorReqSpecific;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
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
            <RefreshCcw
              className={`w-3.5 h-3.5 ${isRefetching ? "animate-spin" : ""}`}
            />
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

      <div className="px-5 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <Input
            placeholder="Search by name, ERMS ID, transaction no., company…"
            value={filters.searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors placeholder:text-gray-400"
          />
        </div>

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

          <FilterField label="Other Requirements Status">
            <Select
              value={filters.minorReqCompleteness}
              onValueChange={(val) =>
                setMinorReqCompletenessFilter(val as MinorReqCompleteness)
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
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

          <FilterField label="Business Unit">
            <Select
              value={filters.businessUnit || "all"}
              onValueChange={(val) =>
                setBusinessUnitFilter(val === "all" ? null : val)
              }
            >
              <SelectTrigger className="text-sm bg-gray-50 border-gray-200 focus:bg-white transition-colors">
                <SelectValue placeholder="All Business Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Business Units</SelectItem>
                {businessUnits.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FilterField>

          <FilterField label="Government ID Status">
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
                <SelectItem value="0-15">0–15 Days</SelectItem>
                <SelectItem value="15-30">15–30 Days</SelectItem>
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

          <FilterField label="Pag-IBIG">
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

          <FilterField label="PhilHealth">
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

        <FilterField label="Contract Start Date">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-sm bg-gray-50 border-gray-200 hover:bg-white font-normal gap-2"
              >
                <CalendarIcon className="w-4 h-4 text-gray-400 shrink-0" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <span className="text-gray-700">
                      {format(dateRange.from, "MMM d, yyyy")}
                      {" — "}
                      {format(dateRange.to, "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-gray-700">
                      {format(dateRange.from, "MMM d, yyyy")}
                    </span>
                  )
                ) : (
                  <span className="text-gray-400">Pick a date range…</span>
                )}
                {dateRange && (
                  <X
                    className="w-3.5 h-3.5 text-gray-400 hover:text-red-500 ml-auto shrink-0 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDateRangeSelect(undefined);
                    }}
                  />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={handleDateRangeSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </FilterField>
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
