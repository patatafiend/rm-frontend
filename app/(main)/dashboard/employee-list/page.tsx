"use client";

import { ClipboardList, AlertCircle } from "lucide-react";
import { EmployeeRequirementsFilters } from "@/components/admin/employee-requirements-filters";
import { EmployeeRequirementsTable } from "@/components/admin/employee-requirements-table";
import { EmployeeRequirementsDrawer } from "@/components/admin/employee-requirements-drawer";
import { EmployeeRequirementsPagination } from "@/components/admin/employee-requirements-pagination";
import { useEmployeeRequirements } from "@/hooks/admin/useEmployeeRequirements";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { Skeleton } from "@/components/ui/skeleton";

export default function EmployeePage() {
  const { isLoading, error } = useEmployeeRequirements();
  const { setSelectedEmployee } = useEmployeeRequirementsStore();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <ClipboardList className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Employee Requirements
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Monitor onboarding document requirements
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <EmployeeRequirementsFilters />

      {/* Table */}
      {isLoading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState error={error} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          <EmployeeRequirementsTable onRowClick={setSelectedEmployee} />
          <div className="border-t border-gray-100 px-4 py-3">
            <EmployeeRequirementsPagination />
          </div>
        </div>
      )}

      <EmployeeRequirementsDrawer />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      {/* Fake table header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex gap-6">
        {[80, 60, 140, 80, 100, 60, 80, 50].map((w, i) => (
          <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
        ))}
      </div>
      {/* Fake rows */}
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="px-4 py-3.5 flex items-center gap-6">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
            <div className="space-y-1.5">
              <Skeleton className="h-3.5 w-32 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-10 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
            <Skeleton className="h-7 w-14 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({ error }: { error: unknown }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 shadow-sm px-5 py-6 flex items-start gap-3">
      <div className="p-1.5 rounded-lg bg-red-100 mt-0.5">
        <AlertCircle className="w-4 h-4 text-red-600" />
      </div>
      <div>
        <p className="text-sm font-semibold text-red-900">
          Failed to load requirements
        </p>
        <p className="text-sm text-red-600 mt-0.5">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again."}
        </p>
      </div>
    </div>
  );
}
