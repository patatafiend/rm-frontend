"use client";

import { useState, useMemo } from "react";
import { Pie, PieChart, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/multi-select";
import { useEmployeeRequirementsStore } from "@/systems/ermp/store/employee-requirements.store";
import { computeMinorReqStatus } from "@/lib/utils/requirements";

const METRICS = [
  { value: "sssCompliance", label: "SSS Compliance" },
  { value: "pagibigCompliance", label: "Pag-IBIG Compliance" },
  { value: "phhealthCompliance", label: "PhilHealth Compliance" },
  { value: "overallCompliance", label: "Overall Compliance" },
  { value: "requirementCompliance", label: "Requirement Compliance" },
] as const;

type MetricKey = (typeof METRICS)[number]["value"];

const METRIC_TO_MISSING: Record<MetricKey, string> = {
  sssCompliance: "missingSss",
  pagibigCompliance: "missingPagibig",
  phhealthCompliance: "missingPhhealth",
  overallCompliance: "missingAnyMajor",
  requirementCompliance: "minorIncomplete",
};

const DONUT_CONFIG: ChartConfig = {
  value: { label: "Employees" },
  Compliant: { label: "Compliant", color: "#16a34a" },
  "Non-Compliant": { label: "Non-Compliant", color: "#dc2626" },
};

export function CompanyRequirementsPieChart() {
  const { requirements } = useEmployeeRequirementsStore();
  const [selectedMetric, setSelectedMetric] =
    useState<MetricKey>("overallCompliance");

  const companyStats = useMemo(() => {
    const map = new Map<
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
      if (!map.has(company)) {
        map.set(company, {
          total: 0,
          missingSss: 0,
          missingPagibig: 0,
          missingPhhealth: 0,
          missingAnyMajor: 0,
          minorIncomplete: 0,
        });
      }
      const stats = map.get(company)!;
      stats.total++;
      if (!employee.rm_sss_no) stats.missingSss++;
      if (!employee.rm_pagibig_no) stats.missingPagibig++;
      if (!employee.rm_phhealth) stats.missingPhhealth++;
      if (
        !employee.rm_sss_no ||
        !employee.rm_pagibig_no ||
        !employee.rm_phhealth
      )
        stats.missingAnyMajor++;
      const minorReqStatus = computeMinorReqStatus(employee);
      if (!minorReqStatus.complete) stats.minorIncomplete++;
    }

    return Array.from(map.entries())
      .map(([company, stats]) => ({ company, ...stats }))
      .sort((a, b) => a.company.localeCompare(b.company));
  }, [requirements]);

  const companyOptions = useMemo(
    () => companyStats.map((c) => ({ label: c.company, value: c.company })),
    [companyStats],
  );

  const [selectedCompanyValues, setSelectedCompanyValues] = useState<string[]>(
    () => companyStats.map((c) => c.company),
  );

  const defaultValues = useMemo(
    () => companyStats.map((c) => c.company),
    [companyStats],
  );

  const selectedCompanies = useMemo(
    () => new Set(selectedCompanyValues),
    [selectedCompanyValues],
  );

  const visibleCompanies = useMemo(
    () =>
      companyStats.filter(
        (c) => selectedCompanies.has(c.company) && c.total > 0,
      ),
    [companyStats, selectedCompanies],
  );

  const metricLabel = METRICS.find((m) => m.value === selectedMetric)?.label;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Requirements Summary</CardTitle>
        <CardDescription>{metricLabel} by Company</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Label className="text-xs text-gray-600 shrink-0">Metric</Label>
          <Select
            value={selectedMetric}
            onValueChange={(v) => setSelectedMetric(v as MetricKey)}
          >
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {METRICS.map((m) => (
                <SelectItem key={m.value} value={m.value} className="text-xs">
                  {m.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-start gap-2">
          <Label className="text-xs text-gray-600 shrink-0 mt-2">
            Companies
          </Label>
          <MultiSelect
            options={companyOptions}
            defaultValue={defaultValues}
            onValueChange={(values) => {
              if (values.length > 0) setSelectedCompanyValues(values);
            }}
            placeholder="Select companies..."
            className="text-xs w-full"
            maxCount={2}
          />
        </div>

        <div className="flex items-center gap-4 px-1">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-600 shrink-0" />
            <span className="text-xs text-gray-500">Compliant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-red-600 shrink-0" />
            <span className="text-xs text-gray-500">Non-Compliant</span>
          </div>
        </div>

        {visibleCompanies.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {visibleCompanies.map((c) => {
              const missingKey = METRIC_TO_MISSING[selectedMetric];
              const missing = c[missingKey as keyof typeof c] as number;
              const compliant = c.total - missing;
              const compliancePct =
                c.total > 0 ? ((compliant / c.total) * 100).toFixed(1) : "0";
              const pctNum = parseFloat(compliancePct);

              const slices = [
                { company: "Compliant", value: compliant, fill: "#16a34a" },
                { company: "Non-Compliant", value: missing, fill: "#dc2626" },
              ];

              return (
                <div
                  key={c.company}
                  className="flex flex-col gap-1 rounded-lg border border-gray-100 bg-gray-50/50 p-3"
                >
                  <div className="flex items-start justify-between gap-2 min-h-[2.5rem]">
                    <p
                      className="text-xs font-medium text-gray-700 leading-tight line-clamp-2"
                      title={c.company}
                    >
                      {c.company}
                    </p>
                    <span
                      className={`shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        pctNum >= 90
                          ? "bg-green-100 text-green-700"
                          : pctNum >= 70
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                      }`}
                    >
                      {compliancePct}%
                    </span>
                  </div>

                  <ChartContainer
                    config={DONUT_CONFIG}
                    className="mx-auto w-full"
                    style={{ height: 130 }}
                  >
                    <PieChart>
                      <Tooltip
                        contentStyle={{ fontSize: 11 }}
                        formatter={(value, name) => [
                          `${value} (${c.total > 0 ? ((Number(value) / c.total) * 100).toFixed(1) : 0}%)`,
                          name,
                        ]}
                      />
                      <Pie
                        data={slices}
                        dataKey="value"
                        nameKey="company"
                        labelLine={false}
                        innerRadius={0}
                        outerRadius={52}
                        strokeWidth={0}
                      />
                    </PieChart>
                  </ChartContainer>

                  <div className="flex justify-center gap-3">
                    <span className="text-xs text-gray-500">
                      <span className="font-medium text-green-700">
                        {compliant}
                      </span>{" "}
                      compliant
                    </span>
                    <span className="text-xs text-gray-500">
                      <span className="font-medium text-red-600">
                        {missing}
                      </span>{" "}
                      lacking
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-40 text-sm text-gray-400">
            No data for selected filters
          </div>
        )}
      </CardContent>
    </Card>
  );
}
