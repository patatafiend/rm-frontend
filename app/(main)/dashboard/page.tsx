"use client";

import { BarChart3 } from "lucide-react";
import { CompanyRequirementsSummary } from "@/components/admin/company-requirements-summary";
import { useEmployeeRequirements } from "@/hooks/admin/useEmployeeRequirements";
import { CompanyRequirementsPieChart } from "@/components/admin/company-requirements-pie-chart";

export default function DashBoard() {
  useEmployeeRequirements();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-50 border border-blue-100">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-tight">
              Company Requirements Summary
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Overview of onboarding compliance by company
            </p>
          </div>
        </div>
      </div>
      <CompanyRequirementsPieChart />
      <CompanyRequirementsSummary />
    </div>
  );
}
