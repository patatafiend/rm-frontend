"use client";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployeeRequirementsStore } from "@/systems/ermp/store/employee-requirements.store";

export function EmployeeRequirementsPagination() {
  const { currentPage, totalPages, setCurrentPage, pageSize, setPageSize } =
    useEmployeeRequirementsStore();

  if (totalPages <= 1) return null;

  const maxPagesToShow = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
  const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(1, endPage - maxPagesToShow + 1);
  }

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i,
  );

  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-400 whitespace-nowrap">
          Rows per page
        </span>
        <Select
          value={String(pageSize)}
          onValueChange={(val) => {
            setPageSize(Number(val));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="h-7 w-16 text-xs bg-gray-50 border-gray-200 focus:bg-white transition-colors">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 25, 50, 100].map((n) => (
              <SelectItem key={n} value={String(n)} className="text-xs">
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-xs text-gray-400">
          Page{" "}
          <span className="font-medium text-gray-600">{currentPage}</span> of{" "}
          <span className="font-medium text-gray-600">{totalPages}</span>
        </span>
      </div>

      <Pagination className="w-auto mx-0">
        <PaginationContent className="gap-0.5">
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              className={`h-7 px-2 text-xs rounded-md ${
                currentPage === 1
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer hover:bg-gray-100"
              }`}
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(1)}
                  className="h-7 w-7 text-xs rounded-md cursor-pointer hover:bg-gray-100"
                >
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis className="h-7 w-7" />
                </PaginationItem>
              )}
            </>
          )}

          {pageNumbers.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                onClick={() => setCurrentPage(page)}
                isActive={page === currentPage}
                className={`h-7 w-7 text-xs rounded-md cursor-pointer ${
                  page === currentPage
                    ? "bg-gray-900 text-white hover:bg-gray-800 border-transparent"
                    : "hover:bg-gray-100"
                }`}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis className="h-7 w-7" />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink
                  onClick={() => setCurrentPage(totalPages)}
                  className="h-7 w-7 text-xs rounded-md cursor-pointer hover:bg-gray-100"
                >
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              className={`h-7 px-2 text-xs rounded-md ${
                currentPage === totalPages
                  ? "pointer-events-none opacity-40"
                  : "cursor-pointer hover:bg-gray-100"
              }`}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
