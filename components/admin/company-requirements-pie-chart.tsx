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
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { computeMinorReqStatus } from "@/lib/utils/requirements";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#dc2626",
  "#d97706",
  "#9333ea",
  "#0891b2",
  "#ea580c",
  "#be185d",
  "#65a30d",
  "#0f766e",
  "#7c3aed",
  "#b45309",
];

const METRICS = [
  { value: "sssCompliance", label: "SSS Compliance" },
  { value: "pagibigCompliance", label: "Pag-IBIG Compliance" },
  { value: "phhealthCompliance", label: "PhilHealth Compliance" },
  { value: "overallCompliance", label: "Overall Compliance" },
] as const;

type MetricKey = (typeof METRICS)[number]["value"];

const METRIC_TO_MISSING: Record<MetricKey, string> = {
  sssCompliance: "missingSss",
  pagibigCompliance: "missingPagibig",
  phhealthCompliance: "missingPhhealth",
  overallCompliance: "missingAnyMajor",
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

  const chartData = useMemo(() => {
    const missingKey = METRIC_TO_MISSING[selectedMetric];

    if (selectedCompanyValues.length === 1) {
      // Single company: show compliant vs non-compliant slices
      const c = companyStats.find(
        (c) => c.company === selectedCompanyValues[0],
      );
      if (!c || c.total === 0) return [];
      const missing = c[missingKey as keyof typeof c] as number;
      const compliant = c.total - missing;
      return [
        { company: "Compliant", value: compliant, fill: "#16a34a" },
        { company: "Non-Compliant", value: missing, fill: "#dc2626" },
      ];
    }

    // Multiple companies: show each company's non-compliant count
    return companyStats
      .filter((c) => selectedCompanies.has(c.company) && c.total > 0)
      .map((c, i) => {
        const missing = c[missingKey as keyof typeof c] as number;
        return {
          company: c.company,
          value: missing,
          fill: CHART_COLORS[i % CHART_COLORS.length],
        };
      })
      .filter((c) => c.value > 0);
  }, [companyStats, selectedCompanies, selectedCompanyValues, selectedMetric]);

  const chartConfig = useMemo(() => {
    const config: ChartConfig = {
      value: {
        label:
          METRICS.find((m) => m.value === selectedMetric)?.label ?? "Value",
      },
    };
    companyStats.forEach((c, i) => {
      config[c.company] = {
        label: c.company,
        color: CHART_COLORS[i % CHART_COLORS.length],
      };
    });
    return config;
  }, [companyStats, selectedMetric]);

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

        {chartData.length > 0 ? (
          <div className="flex flex-col gap-3">
            <ChartContainer
              config={chartConfig}
              className="mx-auto w-full"
              style={{ height: 260 }}
            >
              <PieChart>
                <Tooltip
                  contentStyle={{ fontSize: 12 }}
                  formatter={(value, name) => {
                    if (selectedCompanyValues.length === 1) {
                      const total = chartData.reduce((s, d) => s + d.value, 0);
                      const pct =
                        total > 0
                          ? ((Number(value) / total) * 100).toFixed(1)
                          : "0";
                      return [`${value} employees (${pct}%)`, name];
                    }
                    return [`${value} non-compliant`, name];
                  }}
                />
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="company"
                  labelLine={false}
                />
              </PieChart>
            </ChartContainer>

            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
              {chartData.map((d) => {
                const total = chartData.reduce((s, item) => s + item.value, 0);
                const pct =
                  total > 0 ? ((d.value / total) * 100).toFixed(1) : "0";
                return (
                  <div
                    key={d.company}
                    className="flex items-center gap-1.5 min-w-0"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: d.fill }}
                    />
                    <span className="text-xs text-gray-600 truncate max-w-[180px]">
                      {d.company}
                    </span>
                    <span className="text-xs font-medium text-gray-800">
                      {selectedCompanyValues.length === 1
                        ? `${d.value} (${pct}%)`
                        : `${d.value}`}
                    </span>
                  </div>
                );
              })}
            </div>
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
