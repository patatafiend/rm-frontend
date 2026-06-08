"use client";

import { useState } from "react";
import { ClipboardList, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmployeeRequirementsFilters } from "@/components/admin/employee-requirements-filters";
import { EmployeeRequirementsTable } from "@/components/admin/employee-requirements-table";
import { EmployeeRequirementsDrawer } from "@/components/admin/employee-requirements-drawer";
import { EmployeeRequirementsPagination } from "@/components/admin/employee-requirements-pagination";
import { useEmployeeRequirements } from "@/hooks/admin/useEmployeeRequirements";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { Skeleton } from "@/components/ui/skeleton";
import { UNIVERSAL_REQUIRED_REQS } from "@/lib/utils/requirements";
import * as XLSX from "xlsx";
import type { EmployeeRequirement } from "@/lib/types";

function getMissingDocuments(employee: EmployeeRequirement): string[] {
  const missing: string[] = [];
  if (!employee.rm_sss_no) missing.push("SSS");
  if (!employee.rm_pagibig_no) missing.push("Pagibig");
  if (!employee.rm_phhealth) missing.push("PhilHealth");
  return missing;
}

function getMissingMinorReqs(employee: EmployeeRequirement): string[] {
  if (!employee.minor_reqs) {
    return UNIVERSAL_REQUIRED_REQS;
  }
  const provided = employee.minor_reqs
    .split("; ")
    .map((req) => req.trim())
    .filter(Boolean);
  const providedSet = new Set(provided);
  return UNIVERSAL_REQUIRED_REQS.filter((req) => !providedSet.has(req));
}

function calculateDaysSinceHire(hireDate: string): number {
  const [year, month, day] = hireDate.split("-").map(Number);
  const hire = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = today.getTime() - hire.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

const exportToExcel = (employees: EmployeeRequirement[]) => {
  // Build worksheet data with individual columns for each minor requirement
  const headerRow = [
    "Tran No",
    "ERMS ID",
    "Company",
    "Business Unit",
    "Employee",
    "Status",
    "Contract Date",
    "Days Since Hire",
    "Major Docs",
    ...UNIVERSAL_REQUIRED_REQS,
  ];

  const wsData: (string | number)[][] = [headerRow];

  // Add employee rows
  for (const employee of employees) {
    const missingDocs = getMissingDocuments(employee);
    const majorDocsValue =
      missingDocs.length === 0 ? "Completed" : missingDocs.join(", ");

    const missingMinor = getMissingMinorReqs(employee);
    const missingSet = new Set(missingMinor);

    const contractDate = new Date(employee.contract_sdate).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

    const daysSinceHire = calculateDaysSinceHire(employee.contract_sdate);

    // Build row with individual minor requirement columns
    const row: (string | number)[] = [
      employee.rm_tran_no,
      employee.erms_id,
      employee.hr_company,
      employee.bu_tagging,
      `${employee.rm_first_name} ${employee.rm_lastname}`,
      employee.emp_status,
      contractDate,
      daysSinceHire,
      majorDocsValue,
    ];

    // Add a column for each universal requirement
    for (const req of UNIVERSAL_REQUIRED_REQS) {
      row.push(missingSet.has(req) ? "Missing" : "");
    }

    wsData.push(row);
  }

  // Create workbook and worksheet
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Employee Requirements");

  // Generate filename with current date
  const today = new Date().toISOString().split("T")[0];
  const filename = `employee-requirements-${today}.xlsx`;

  // Trigger download
  XLSX.writeFile(wb, filename);
};

export default function EmployeePage() {
  const { isLoading, error } = useEmployeeRequirements();
  const { setSelectedEmployee, filteredRequirements } =
    useEmployeeRequirementsStore();
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Small delay to ensure state updates visually
      await new Promise((resolve) => setTimeout(resolve, 100));
      exportToExcel(filteredRequirements);
    } finally {
      setIsExporting(false);
    }
  };

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

      {/* Export Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleExport}
          disabled={isExporting || isLoading}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

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
