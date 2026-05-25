"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsersStore } from "@/store/users.store";
import type { UserSummary } from "@/lib/types";

function formatAccountType(accountType: string | null) {
  if (!accountType) return "Unknown";
  return accountType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getDisplayName(user: UserSummary) {
  const name = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  return name.length > 0 ? name : "Unnamed user";
}

function StatusBadge({ blocked }: { blocked: boolean }) {
  return (
    <Badge
      variant="outline"
      className={
        blocked
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-emerald-200 bg-emerald-50 text-emerald-700"
      }
    >
      {blocked ? "Blocked" : "Active"}
    </Badge>
  );
}

export function UsersListTable() {
  const { items, roleMap } = useUsersStore();

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-10 text-center">
        <p className="text-sm font-semibold text-gray-700">No users found</p>
        <p className="text-xs text-gray-400">
          Try adjusting filters or clearing your search.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="w-[260px]">User</TableHead>
            <TableHead>Email</TableHead>
            <TableHead className="w-[200px]">Role</TableHead>
            <TableHead className="w-[160px]">Account Type</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead className="w-[180px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((user) => (
            <TableRow key={user.id} className="hover:bg-gray-50/60">
              <TableCell className="px-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-gray-900">
                    {getDisplayName(user)}
                  </p>
                  <p className="text-xs text-gray-400">ID {user.id}</p>
                </div>
              </TableCell>
              <TableCell className="px-4 text-sm text-gray-600">
                {user.email}
              </TableCell>
              <TableCell className="px-4 text-sm text-gray-600">
                {user.role_id
                  ? (roleMap[user.role_id] ?? "Unassigned")
                  : "Unassigned"}
              </TableCell>
              <TableCell className="px-4 text-xs text-gray-500">
                {formatAccountType(user.account_type)}
              </TableCell>
              <TableCell className="px-4">
                <StatusBadge blocked={user.is_blocked} />
              </TableCell>
              <TableCell className="px-4">
                <div className="flex items-center justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/user-list/${user.id}`}>View</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/user-list/${user.id}?mode=edit`}>
                      Edit
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
