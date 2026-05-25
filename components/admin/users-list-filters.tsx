"use client";

import { Search, SlidersHorizontal, RefreshCcw, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsersStore } from "@/store/users.store";

const ACCOUNT_TYPE_OPTIONS = [
  { value: "all", label: "All types" },
  { value: "company_account", label: "Company" },
  { value: "client_account", label: "Client" },
  { value: "admin_account", label: "Admin" },
  { value: "super_admin_account", label: "Super admin" },
];

const BLOCKED_OPTIONS = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "blocked", label: "Blocked" },
];

export function UsersListFilters({
  onRefresh,
  isRefreshing,
}: {
  onRefresh: () => void;
  isRefreshing: boolean;
}) {
  const {
    filters,
    setSearchTerm,
    setAccountType,
    setBlockedFilter,
    clearFilters,
  } = useUsersStore();

  const hasActiveFilters =
    filters.search.trim().length > 0 ||
    filters.accountType !== "all" ||
    filters.blocked !== "all";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white/90 shadow-sm">
      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gray-900 text-white">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          Filter users
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            className="h-7 px-2 text-xs text-gray-600 hover:text-gray-900"
            disabled={isRefreshing}
          >
            <RefreshCcw
              className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`}
            />
            {isRefreshing ? "Refreshing" : "Refresh"}
          </Button>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-7 px-2 text-xs text-gray-500 hover:text-red-600"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 border-t border-gray-100 p-5 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name or email"
            value={filters.search}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="pl-9"
          />
        </div>

        <Select
          value={filters.accountType}
          onValueChange={(value) => setAccountType(value)}
        >
          <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            {ACCOUNT_TYPE_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.blocked}
          onValueChange={(value) => setBlockedFilter(value as "all" | "active" | "blocked")}
        >
          <SelectTrigger className="w-full bg-gray-50">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {BLOCKED_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
