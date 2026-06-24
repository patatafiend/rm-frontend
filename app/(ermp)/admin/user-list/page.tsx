"use client";

import { UsersRound, AlertCircle, UserRoundPlus } from "lucide-react";
import { UsersListFilters } from "@/systems/ermp/components/admin/users-list-filters";
import { UsersListTable } from "@/systems/ermp/components/admin/users-list-table";
import { UsersListPagination } from "@/systems/ermp/components/admin/users-list-pagination";
import { UsersListStats } from "@/systems/ermp/components/admin/users-list-stats";
import { useUsers } from "@/systems/ermp/hooks/admin/useUsers";
import { useUsersStore } from "@/systems/ermp/store/users.store";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UsersPage() {
  const { usersQuery } = useUsers();
  const { loading, error, total } = useUsersStore();

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-amber-50 via-white to-rose-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <UsersRound className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Users</h1>
              <p className="text-sm text-gray-500">
                Manage user accounts, roles, and access.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              Total users:{" "}
              <span className="font-semibold text-gray-900">{total}</span>
            </div>
            <Button asChild>
              <Link href="/admin/user-list/create">
                <UserRoundPlus className="h-4 w-4" />
                Create user
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <UsersListStats />

      <UsersListFilters
        onRefresh={() => usersQuery.refetch()}
        isRefreshing={usersQuery.isRefetching}
      />

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState error={error} onRetry={() => usersQuery.refetch()} />
      ) : (
        <UsersListTable />
      )}

      {!loading && !error && <UsersListPagination />}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-6 border-b border-gray-100 bg-gray-50 px-6 py-4">
        {[120, 200, 140, 120, 90].map((width, index) => (
          <Skeleton key={index} className="h-3 rounded" style={{ width }} />
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex items-center gap-6 px-6 py-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-32 rounded" />
              <Skeleton className="h-2.5 w-20 rounded" />
            </div>
            <Skeleton className="h-4 w-40 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="ml-auto h-7 w-28 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

function ErrorState({
  error,
  onRetry,
}: {
  error: string;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-red-900">
            Failed to load users
          </p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
        <button
          onClick={onRetry}
          className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
