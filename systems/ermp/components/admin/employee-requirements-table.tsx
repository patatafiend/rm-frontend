"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ArrowUpDown, Eye } from "lucide-react";
import { useEmployeeRequirementsStore } from "@/systems/ermp/store/employee-requirements.store";
import { useEmployeeRequirementsFilter } from "@/systems/ermp/hooks/admin/useEmployeeRequirementsFilter";
import { UNIVERSAL_REQUIRED_REQS } from "@/lib/utils/requirements";
import type { SortField } from "@/systems/ermp/store/employee-requirements.store";
import type { EmployeeRequirement } from "@/lib/types";

interface EmployeeRequirementsTableProps {
  onRowClick: (employee: EmployeeRequirement) => void;
}

function calculateDaysSinceHire(hireDate: string): {
  days: number;
  isFuture: boolean;
  label: string;
} {
  const [year, month, day] = hireDate.split("-").map(Number);
  const hire = new Date(year, month - 1, day);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = today.getTime() - hire.getTime();
  const days = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const isFuture = days < 0;
  const label = isFuture ? `${Math.abs(days)}d until` : `${days}d since`;
  return { days: Math.abs(days), isFuture, label };
}

function getRequirementStatus(
  employee: EmployeeRequirement,
): "Incomplete" | "Completed" {
  const isIncomplete =
    !employee.rm_sss_no || !employee.rm_pagibig_no || !employee.rm_phhealth;
  return isIncomplete ? "Incomplete" : "Completed";
}

function getDaysColor(days: number) {
  if (days <= 7) return "text-green-600";
  if (days <= 30) return "text-yellow-600";
  return "text-red-500";
}

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

interface SortButtonProps {
  field: SortField;
  label: string;
  sortField: SortField;
  sortOrder: "asc" | "desc";
  onSort: (field: SortField) => void;
}

function SortButton({
  field,
  label,
  sortField,
  sortOrder,
  onSort,
}: SortButtonProps) {
  const isActive = sortField === field;
  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-1.5 group font-medium text-xs uppercase tracking-wide text-gray-500 hover:text-gray-900 transition-colors"
    >
      {label}
      <span className="text-gray-300 group-hover:text-gray-500 transition-colors">
        {isActive ? (
          sortOrder === "asc" ? (
            <ArrowUp className="w-3.5 h-3.5 text-gray-700" />
          ) : (
            <ArrowDown className="w-3.5 h-3.5 text-gray-700" />
          )
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5" />
        )}
      </span>
    </button>
  );
}

export function EmployeeRequirementsTable({
  onRowClick,
}: EmployeeRequirementsTableProps) {
  const { getPaginatedData, sortField, setSortField, sortOrder, setSortOrder } =
    useEmployeeRequirementsStore();
  const { reqStatus: statusCache } = useEmployeeRequirementsFilter();

  const data = getPaginatedData();

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="w-full px-6 py-8 space-y-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50 border-b border-gray-200">
              <TableHead className="py-3 px-4 w-[120px]">
                <SortButton
                  field="rm_tran_no"
                  label="Tran No"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="py-3 px-4 w-[100px]">
                <SortButton
                  field="erms_id"
                  label="ERMS ID"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
                  Employee
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <SortButton
                  field="emp_status"
                  label="Status"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="py-3 px-4">
                <SortButton
                  field="contract_sdate"
                  label="Contract Date"
                  sortField={sortField}
                  sortOrder={sortOrder}
                  onSort={handleSort}
                />
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
                  Days Since Hire
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
                  Government IDs
                </span>
              </TableHead>
              <TableHead className="py-3 px-4">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
                  Other Requirements
                </span>
              </TableHead>
              <TableHead className="py-3 px-4 text-right">
                <span className="font-medium text-xs uppercase tracking-wide text-gray-500">
                  Action
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="h-32 text-center text-sm text-gray-400"
                >
                  No records found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((employee) => {
                const { days, label, isFuture } = calculateDaysSinceHire(
                  employee.contract_sdate,
                );
                const reqStatus = getRequirementStatus(employee);
                return (
                  <TableRow
                    key={`${employee.rm_tran_no}-${employee.erms_id}`}
                    className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <TableCell className="py-3.5 px-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {employee.rm_tran_no}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                        {employee.erms_id}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <p className="text-sm font-medium text-gray-900 leading-tight">
                        {employee.rm_first_name} {employee.rm_lastname}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {employee.hr_company}
                      </p>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                        {employee.emp_status}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-sm text-gray-600">
                      {new Date(employee.contract_sdate).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )}
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <span
                        className={`text-sm font-semibold tabular-nums ${
                          isFuture ? "text-blue-600" : getDaysColor(days)
                        }`}
                      >
                        {label}
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      <div className="flex gap-1 flex-wrap items-start">
                        {getMissingDocuments(employee).length === 0 ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              reqStatus === "Incomplete"
                                ? "bg-amber-50 text-amber-700 border-amber-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                reqStatus === "Incomplete"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                            />
                            {reqStatus}
                          </span>
                        ) : (
                          getMissingDocuments(employee).map((doc) => (
                            <span
                              key={doc}
                              className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                            >
                              {doc}
                            </span>
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-4">
                      {(() => {
                        const status = statusCache.get(employee.rm_tran_no);
                        const minorReqs = getMissingMinorReqs(employee);
                        return minorReqs.length === 0 ? (
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                              status?.complete
                                ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                                : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                status?.complete
                                  ? "bg-emerald-500"
                                  : "bg-amber-500"
                              }`}
                            />
                            {status?.complete ? "Complete" : "Incomplete"}
                          </span>
                        ) : (
                          <div className="flex gap-1 flex-wrap">
                            {minorReqs.map((req) => (
                              <span
                                key={req}
                                className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100"
                              >
                                {req}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </TableCell>
                    <TableCell className="py-3.5 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRowClick(employee)}
                        className="h-7 px-2.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
