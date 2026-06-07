"use client";

import { Badge } from "@/components/ui/badge";
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
      className +=
        "bg-red-100 text-red-600 hover:bg-red-100 hover:text-red-600";
    }

    return <Badge className={className}>{compliancePercent}%</Badge>;
  };

const calculateCompliance = (
    total: number,
    missingAnyMajor: number
  ): string => {
    if (total === 0) return "0";
    return (((total - missingAnyMajor) / total) * 100).toFixed(0);
  };

export function CompanyRequirementsSummary() {
  const router = useRouter();
  const { requirements, setCompanyFilter } = useEmployeeRequirementsStore();

  // Aggregate data by company
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
      !employee.rm_sss_no ||
      !employee.rm_pagibig_no ||
      !employee.rm_phhealth;
    if (hasMissingMajor) stats.missingAnyMajor++;

    const minorReqStatus = computeMinorReqStatus(employee);
    if (!minorReqStatus.complete) stats.minorIncomplete++;
  }

  // Convert to array and sort by company name
  const companies = Array.from(companyStats.entries())
    .map(([company, stats]) => ({
      company,
      ...stats,
    }))
    .sort((a, b) => a.company.localeCompare(b.company));

  // Calculate totals
  const totals = {
    total: companies.reduce((sum, c) => sum + c.total, 0),
    missingSss: companies.reduce((sum, c) => sum + c.missingSss, 0),
    missingPagibig: companies.reduce((sum, c) => sum + c.missingPagibig, 0),
    missingPhhealth: companies.reduce((sum, c) => sum + c.missingPhhealth, 0),
    missingAnyMajor: companies.reduce((sum, c) => sum + c.missingAnyMajor, 0),
    minorIncomplete: companies.reduce((sum, c) => sum + c.minorIncomplete, 0),
  };




  const handleRowClick = (companyName: string) => {
    setCompanyFilter(companyName);
    router.push("/dashboard/employee-list");
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-b border-gray-200">
            <TableHead className="h-10 px-4 py-2 text-left text-xs font-semibold text-gray-700">
              Company
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Total
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Missing SSS
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Missing Pag-IBIG
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Missing PhilHealth
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Missing Any Major
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Minor Incomplete
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Minor Req Compliance %
            </TableHead>
            <TableHead className="h-10 px-4 py-2 text-center text-xs font-semibold text-gray-700">
              Major Req Compliance %
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {companies.map((company) => {
            const compliance = parseFloat(
              calculateCompliance(company.total, company.missingAnyMajor)
            );
            return (
              <TableRow
                key={company.company}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => handleRowClick(company.company)}
              >
                <TableCell className="px-4 py-3 text-sm font-medium text-gray-900">
                  {company.company}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.total}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.missingSss}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.missingPagibig}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.missingPhhealth}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.missingAnyMajor}
                </TableCell>
                <TableCell className="px-4 py-3 text-center text-sm text-gray-700">
                  {company.minorIncomplete}
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <ComplianceBadge
                    compliancePercent={parseFloat(
                      calculateCompliance(company.total, company.minorIncomplete)
                    )}
                  />
                </TableCell>
                <TableCell className="px-4 py-3 text-center">
                  <ComplianceBadge compliancePercent={compliance} />
                </TableCell>
              </TableRow>
            );
          })}
          {/* Totals row */}
          <TableRow className="border-t-2 border-gray-200 bg-gray-50">
            <TableCell className="px-4 py-3 text-sm font-semibold text-gray-900">
              Total
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.total}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.missingSss}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.missingPagibig}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.missingPhhealth}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.missingAnyMajor}
            </TableCell>
            <TableCell className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
              {totals.minorIncomplete}
            </TableCell>
            <TableCell className="px-4 py-3 text-center">
              <ComplianceBadge
                compliancePercent={parseFloat(
                  calculateCompliance(totals.total, totals.minorIncomplete)
                )}
              />
            </TableCell>
            <TableCell className="px-4 py-3 text-center">
              <ComplianceBadge
                compliancePercent={parseFloat(
                  calculateCompliance(totals.total, totals.missingAnyMajor)
                )}
              />
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
