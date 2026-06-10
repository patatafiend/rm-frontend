"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { computeMinorReqStatus } from "@/lib/utils/requirements";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

const ComplianceBadge = ({
  compliancePercent,
}: {
  compliancePercent: number;
}) => {
  let className = "font-medium ";

  if (compliancePercent === 0) {
    className += "text-gray-400";
  } else if (compliancePercent >= 90) {
    className +=
      "bg-green-100 text-green-700 hover:bg-green-100 hover:text-green-700";
  } else if (compliancePercent >= 70) {
    className +=
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-100 hover:text-yellow-700";
  } else {
    className += "bg-red-100 text-red-600 hover:bg-red-100 hover:text-red-600";
  }

  return <Badge className={className}>{compliancePercent}%</Badge>;
};

const calculateCompliance = (
  total: number,
  missingAnyMajor: number,
): string => {
  if (total === 0) return "0";
  return (((total - missingAnyMajor) / total) * 100).toFixed(0);
};

interface CompanyRow {
  company: string;
  total: number;
  missingSss: number;
  missingPagibig: number;
  missingPhhealth: number;
  missingAnyMajor: number;
  minorIncomplete: number;
}

interface TotalsRow {
  total: number;
  missingSss: number;
  missingPagibig: number;
  missingPhhealth: number;
  missingAnyMajor: number;
  minorIncomplete: number;
}

const exportToExcel = (companies: CompanyRow[], totals: TotalsRow) => {
  const wsData: (string | number)[][] = [
    [
      "Company",
      "Total",
      "Lacking SSS",
      "Lacking Pag-IBIG",
      "Lacking PhilHealth",
      "Missing Any Major",
      "Minor Incomplete",
      "Minor Req Compliance %",
      "Major Req Compliance %",
    ],
  ];

  for (const company of companies) {
    const minorCompliance = calculateCompliance(
      company.total,
      company.minorIncomplete,
    );
    const majorCompliance = calculateCompliance(
      company.total,
      company.missingAnyMajor,
    );

    wsData.push([
      company.company,
      company.total,
      company.missingSss,
      company.missingPagibig,
      company.missingPhhealth,
      company.missingAnyMajor,
      company.minorIncomplete,
      `${minorCompliance}%`,
      `${majorCompliance}%`,
    ]);
  }

  const totalMinorCompliance = calculateCompliance(
    totals.total,
    totals.minorIncomplete,
  );
  const totalMajorCompliance = calculateCompliance(
    totals.total,
    totals.missingAnyMajor,
  );

  wsData.push([
    "Total",
    totals.total,
    totals.missingSss,
    totals.missingPagibig,
    totals.missingPhhealth,
    totals.missingAnyMajor,
    totals.minorIncomplete,
    `${totalMinorCompliance}%`,
    `${totalMajorCompliance}%`,
  ]);

  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Company Summary");

  const today = new Date().toISOString().split("T")[0];
  const filename = `company-requirements-summary-${today}.xlsx`;

  XLSX.writeFile(wb, filename);
};

function CompanyRequirementsSummarySkeleton() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
      {/* Export button placeholder */}
      <div className="flex justify-end px-4 pt-4 pb-0">
        <div className="h-8 w-20 rounded-md bg-gray-100" />
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            <TableHead className="h-8 px-4 py-1" />
            <TableHead
              colSpan={4}
              className="h-8 px-4 py-1 border-l border-gray-200 bg-gray-50"
            >
              <div className="h-3 w-12 rounded bg-gray-200 mx-auto" />
            </TableHead>
            <TableHead
              colSpan={1}
              className="h-8 px-4 py-1 border-l border-gray-200 bg-gray-50"
            >
              <div className="h-3 w-14 rounded bg-gray-200 mx-auto" />
            </TableHead>
            <TableHead className="h-8 px-4 py-1 border-l border-gray-200" />
          </TableRow>
          <TableRow className="border-b border-gray-200">
            {[
              "w-32",
              "w-20",
              "w-24",
              "w-28",
              "w-16",
              "w-24",
              "w-36",
              "w-36",
            ].map((w, i) => (
              <TableHead
                key={i}
                className={`h-10 px-4 py-2 ${i === 1 || i === 5 || i === 6 || i === 7 ? "border-l border-gray-200" : ""}`}
              >
                <div
                  className={`h-3 ${w} rounded bg-gray-200 ${i > 0 ? "mx-auto" : ""}`}
                />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <TableRow key={rowIdx} className="border-b border-gray-100">
              <TableCell className="px-4 py-3">
                <div className="h-3.5 w-48 rounded bg-gray-100" />
              </TableCell>
              {[1, 2, 3, 4].map((i) => (
                <TableCell
                  key={i}
                  className={`px-4 py-3 text-center ${i === 1 ? "border-l border-gray-200" : ""}`}
                >
                  <div className="h-3.5 w-6 rounded bg-gray-100 mx-auto" />
                </TableCell>
              ))}
              <TableCell className="px-4 py-3 text-center border-l border-gray-200">
                <div className="h-3.5 w-6 rounded bg-gray-100 mx-auto" />
              </TableCell>
              {[6, 7].map((i) => (
                <TableCell
                  key={i}
                  className="px-4 py-3 text-center border-l border-gray-200"
                >
                  <div className="h-5 w-12 rounded-full bg-gray-100 mx-auto" />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export function CompanyRequirementsSummary() {
  const router = useRouter();
  const { requirements, setCompanyFilter, loading } =
    useEmployeeRequirementsStore();
  const [isExporting, setIsExporting] = useState(false);

  const companyStats = new Map<
    string,
    {
      total: number;
      missingSss: number;
      missingPagibig: number;
      missingPhhealth: number;
      missingAnyMajor: number;
      minorIncomplete: number;
    }
  >();

  for (const employee of requirements) {
    const company = employee.hr_company;

    if (!companyStats.has(company)) {
      companyStats.set(company, {
        total: 0,
        missingSss: 0,
        missingPagibig: 0,
        missingPhhealth: 0,
        missingAnyMajor: 0,
        minorIncomplete: 0,
      });
    }

    const stats = companyStats.get(company)!;
    stats.total++;

    if (!employee.rm_sss_no) stats.missingSss++;
    if (!employee.rm_pagibig_no) stats.missingPagibig++;
    if (!employee.rm_phhealth) stats.missingPhhealth++;

    const hasMissingMajor =
      !employee.rm_sss_no || !employee.rm_pagibig_no || !employee.rm_phhealth;
    if (hasMissingMajor) stats.missingAnyMajor++;

    const minorReqStatus = computeMinorReqStatus(employee);
    if (!minorReqStatus.complete) stats.minorIncomplete++;
  }

  const companies = Array.from(companyStats.entries())
    .map(([company, stats]) => ({
      company,
      ...stats,
    }))
    .sort((a, b) => a.company.localeCompare(b.company));

  const totals = {
    total: companies.reduce((sum, c) => sum + c.total, 0),
    missingSss: companies.reduce((sum, c) => sum + c.missingSss, 0),
    missingPagibig: companies.reduce((sum, c) => sum + c.missingPagibig, 0),
    missingPhhealth: companies.reduce((sum, c) => sum + c.missingPhhealth, 0),
    missingAnyMajor: companies.reduce((sum, c) => sum + c.missingAnyMajor, 0),
    minorIncomplete: companies.reduce((sum, c) => sum + c.minorIncomplete, 0),
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      exportToExcel(companies, totals);
    } finally {
      setIsExporting(false);
    }
  };

  const handleRowClick = (companyName: string) => {
    setCompanyFilter(companyName);
    router.push("/dashboard/employee-list");
  };

  if (loading) return <CompanyRequirementsSummarySkeleton />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex justify-end px-4 pt-4 pb-0">
        <Button
          onClick={handleExport}
          disabled={isExporting}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-100">
            <TableHead className="h-8 px-4 py-1" />
            <TableHead
              colSpan={4}
              className="h-8 px-4 py-1 text-center text-xs font-semibold border-l border-gray-200 bg-gray-50"
            >
              15 Days
            </TableHead>
            <TableHead
              colSpan={2}
              className="h-8 px-4 py-1 text-center text-xs font-semibold border-l border-gray-200 bg-gray-50"
            >
              30 Days
            </TableHead>
          </TableRow>
          <TableRow className="border-b border-gray-200">
            <TableHead className="h-10 px-4 py-2 text-left text-xs font-semibold text-gray-700 ">
              Company
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Lacking SSS
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Lacking Pag-IBIG
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Lacking PhilHealth
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Total
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Lacking Requirements
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700 border-l border-gray-200">
              Requirement Compliance %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            return (
              <TableRow
                key={company.company}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(company.company)}
              >
                <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                  {company.company}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700 border-l border-gray-200">
                  {company.missingSss}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700 border-l border-gray-200">
                  {company.missingPagibig}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700 border-l border-gray-200">
                  {company.missingPhhealth}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700 border-l border-gray-200">
                  {company.missingAnyMajor}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700 border-l border-gray-200">
                  {company.minorIncomplete}
                </TableCell>
                <TableCell className="px-4 py-3 text-center border-l border-gray-200">
                  <ComplianceBadge
                    compliancePercent={parseFloat(
                      calculateCompliance(
                        company.total,
                        company.minorIncomplete,
                      ),
                    )}
                  />
                </TableCell>
              </TableRow>
            );
          })}
          {/* Totals row */}
          <TableRow className="border-t-2 border-gray-200 bg-gray-50">
            <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900 ">
              Total
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
              {totals.missingSss}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
              {totals.missingPagibig}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
              {totals.missingPhhealth}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
              {totals.missingAnyMajor}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900 border-l border-gray-200">
              {totals.minorIncomplete}
            </TableCell>
            <TableCell className="px-4 py-3 text-center border-l border-gray-200">
              <ComplianceBadge
                compliancePercent={parseFloat(
                  calculateCompliance(totals.total, totals.minorIncomplete),
                )}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
