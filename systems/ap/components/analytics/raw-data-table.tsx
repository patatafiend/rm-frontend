"use client";

import { useMemo } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAnalyticsStore } from "@/systems/ap/store/analytics.store";
import { useAnalyticsRaw } from "@/systems/ap/hooks/useAnalytics";
import type { RawApplicant } from "@/systems/ap/lib/api/analytics";

const VALID_STATUSES = [
  "Applicant",
  "For Medical",
  "For Onboarding",
  "Failed Drug test",
  "Onboarded",
];

const STATUS_BADGE: Record<string, string> = {
  Onboarded: "bg-green-100 text-green-700",
  Applicant: "bg-indigo-100 text-indigo-700",
  "For Medical": "bg-amber-100 text-amber-700",
  "For Onboarding": "bg-blue-100 text-blue-700",
  "Failed Drug test": "bg-red-100 text-red-700",
};

function exportToCsv(rows: RawApplicant[]) {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = (row as unknown as Record<string, unknown>)[h];
          if (val === null || val === undefined) return "";
          const str = String(val);
          return str.includes(",") || str.includes('"') || str.includes("\n")
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `hiring-pipeline-raw-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function RawDataTable() {
  const { rawData, rawTotal, rawOffset, rawLimit, filters, setFilter, setPage } =
    useAnalyticsStore();
  const { isLoading, isRefetching } = useAnalyticsRaw();

  const totalPages = Math.ceil(rawTotal / rawLimit);
  const currentPage = Math.floor(rawOffset / rawLimit) + 1;

  const buOptions = useMemo(
    () => Array.from(new Set(rawData.map((r) => r.bu_tagging).filter(Boolean))).sort(),
    [rawData],
  );
  const companyOptions = useMemo(
    () => Array.from(new Set(rawData.map((r) => r.hr_company).filter(Boolean))).sort(),
    [rawData],
  );

  const showSkeleton = isLoading && rawData.length === 0;

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filters.status || "all"} onValueChange={(v) => setFilter("status", v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 w-44 text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {VALID_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.bu || "all"} onValueChange={(v) => setFilter("bu", v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 w-48 text-xs">
            <SelectValue placeholder="All BUs" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All BUs</SelectItem>
            {buOptions.map((b) => (
              <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.company || "all"} onValueChange={(v) => setFilter("company", v === "all" ? "" : v)}>
          <SelectTrigger className="h-8 w-56 text-xs">
            <SelectValue placeholder="All companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All companies</SelectItem>
            {companyOptions.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-2">
          {isRefetching && (
            <span className="text-xs text-gray-400 animate-pulse">Refreshing…</span>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            onClick={() => exportToCsv(rawData)}
            disabled={rawData.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              {["Tran No", "Name", "Position", "Company", "BU", "Status", "Encode Date", "Contract Date"].map((h) => (
                <TableHead key={h} className="text-xs font-semibold uppercase tracking-wide text-gray-400 px-4">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {showSkeleton
              ? Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j} className="px-4 py-3">
                        <Skeleton className="h-3 w-full rounded" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              : rawData.length === 0
              ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-16 text-center text-sm text-gray-400">
                      No results for selected filters
                    </TableCell>
                  </TableRow>
                )
              : rawData.map((row) => (
                  <TableRow key={`${row.rm_tran_no}-${row.rm_job_status}`}>
                    <TableCell className="px-4 py-3 text-xs font-mono">{row.rm_tran_no}</TableCell>
                    <TableCell className="px-4 py-3 text-xs">
                      {[row.rm_first_name, row.rm_middle_name].filter(Boolean).join(" ")}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500">{row.rm_pos_applied}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500">{row.hr_company}</TableCell>
                    <TableCell className="px-4 py-3 text-xs text-gray-500">{row.bu_tagging}</TableCell>
                    <TableCell className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_BADGE[row.rm_job_status] ?? "bg-gray-100 text-gray-700"}`}>
                        {row.rm_job_status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-mono text-gray-500">
                      {row.rm_encode_date ? new Date(row.rm_encode_date).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-xs font-mono text-gray-500">
                      {row.admin_condate ? new Date(row.admin_condate).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing {rawOffset + 1}–{Math.min(rawOffset + rawLimit, rawTotal)} of {rawTotal.toLocaleString()}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              disabled={currentPage === 1}
              onClick={() => setPage(rawOffset - rawLimit)}
            >
              Prev
            </Button>
            <span>
              Page {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 px-3 text-xs"
              disabled={currentPage === totalPages}
              onClick={() => setPage(rawOffset + rawLimit)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
