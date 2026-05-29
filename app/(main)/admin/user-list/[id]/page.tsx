"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  AlertCircle,
  Shield,
  Edit,
  Trash2,
  Ban,
  MoreVertical,
  Lock,
  Calendar,
  User,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { usersApi } from "@/lib/api/users";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUsers } from "@/hooks/admin/useUsers";

// ── Helpers ────────────────────────────────────────────────

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  admin_account: "Admin",
  user_account: "User",
  super_admin_account: "Super Admin",
  audit_account: "Audit",
};

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string,
) {
  if (firstName && lastName)
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  if (firstName) return firstName[0].toUpperCase();
  if (email) return email[0].toUpperCase();
  return "?";
}

// ── Sub-components ──────────────────────────────────────────

function InfoField({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: React.ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p
        className={`text-sm font-medium text-gray-900 ${mono ? "font-mono" : ""}`}
      >
        {value || <span className="text-gray-300">—</span>}
      </p>
    </div>
  );
}

function SectionHeading({
  icon: Icon,
  title,
}: {
  icon: React.ElementType;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2 pb-3 mb-1">
      <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </p>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
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
            Failed to load user
          </p>
          <p className="mt-1 text-sm text-red-600">{message}</p>
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

// ── Page ───────────────────────────────────────────────────

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params?.id);
  const { deleteUserMutation, toggleBlockMutation } = useUsers();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showBlockDialog, setShowBlockDialog] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["users", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });

  const handleDelete = async () => {
    try {
      await deleteUserMutation.mutateAsync(userId);
      toast.success("User deleted successfully");
      router.push("/admin/user-list");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete user",
      );
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleToggleBlock = async () => {
    try {
      await toggleBlockMutation.mutateAsync(userId);
      await refetch();
      toast.success(
        `User ${user?.is_blocked ? "unblocked" : "blocked"} successfully`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to update user",
      );
    } finally {
      setShowBlockDialog(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-36 rounded-3xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="space-y-6">
            <Skeleton className="h-64 rounded-3xl" />
            <Skeleton className="h-48 rounded-3xl" />
          </div>
          <Skeleton className="h-72 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <ErrorState
        message={error instanceof Error ? error.message : "Unknown error"}
        onRetry={refetch}
      />
    );
  }

  const fullName = [user.first_name, user.middle_name, user.last_name]
    .filter(Boolean)
    .join(" ");

  const initials = getInitials(user.first_name, user.last_name, user.email);

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          {/* Left: back + identity */}
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={() => router.back()}
              className="mt-1 shrink-0 text-gray-400 hover:text-gray-700 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            {/* Avatar */}
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white text-sm font-semibold">
              {initials}
            </div>

            {/* Name + meta */}
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-gray-900 truncate">
                {fullName || user.email}
              </h1>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>

              {/* Status badges inline under name */}
              <div className="mt-2 flex flex-wrap gap-2">
                {user.is_blocked ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">
                    <Ban className="h-3 w-3" />
                    Blocked
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle className="h-3 w-3" />
                    Active
                  </span>
                )}
                {user.mfa_enabled && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    <Shield className="h-3 w-3" />
                    MFA On
                  </span>
                )}
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-semibold text-gray-600">
                  {ACCOUNT_TYPE_LABELS[user.account_type ?? ""] ??
                    user.account_type}
                </span>
              </div>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/admin/user-list/${userId}/edit`)}
              className="gap-1.5"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="px-2">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => setShowBlockDialog(true)}
                  className="cursor-pointer gap-2"
                >
                  <Ban className="h-4 w-4" />
                  {user.is_blocked ? "Unblock user" : "Block user"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteDialog(true)}
                  className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete user
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        {/* ── Main ── */}
        <div className="space-y-6">
          {/* Personal + Contact consolidated */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <SectionHeading icon={User} title="Personal information" />
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoField label="First name" value={user.first_name} />
              <InfoField label="Middle name" value={user.middle_name} />
              <InfoField label="Last name" value={user.last_name} />
              <InfoField label="Username" value={user.username} />
              <InfoField label="Email" value={user.email} mono />
              <InfoField label="Phone" value={user.phone_number} mono />
            </div>
          </div>

          {/* Account + Security consolidated */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm space-y-6">
            <SectionHeading icon={Lock} title="Account & security" />
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoField
                label="Account type"
                value={
                  ACCOUNT_TYPE_LABELS[user.account_type ?? ""] ??
                  user.account_type
                }
              />
              <InfoField label="Role ID" value={user.role_id} />
              <InfoField label="Company ID" value={user.company_id} />
              <InfoField label="Client ID" value={user.client_id} />
              <InfoField
                label="MFA"
                value={
                  <span
                    className={`inline-flex items-center gap-1.5 ${user.mfa_enabled ? "text-emerald-600" : "text-gray-400"}`}
                  >
                    {user.mfa_enabled ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Enabled
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3.5 w-3.5" /> Disabled
                      </>
                    )}
                  </span>
                }
              />
              <InfoField
                label="Status"
                value={
                  <span
                    className={`inline-flex items-center gap-1.5 ${user.is_blocked ? "text-red-600" : "text-emerald-600"}`}
                  >
                    {user.is_blocked ? (
                      <>
                        <Ban className="h-3.5 w-3.5" /> Blocked
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" /> Active
                      </>
                    )}
                  </span>
                }
              />
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">
          {/* Timestamps */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <SectionHeading icon={Calendar} title="Timestamps" />
            <div className="space-y-4 mt-1">
              <InfoField
                label="Created"
                value={formatDate(user.created_at)}
                mono
              />
              <InfoField
                label="Last updated"
                value={formatDate(user.updated_at)}
                mono
              />
            </div>
          </div>

          {/* Danger zone */}
          <div className="rounded-3xl border border-red-100 bg-red-50 p-5 shadow-sm space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-red-400">
              Danger zone
            </p>
            <button
              onClick={() => setShowBlockDialog(true)}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Ban className="h-4 w-4 shrink-0" />
                {user.is_blocked ? "Unblock this user" : "Block this user"}
              </span>
              <span className="mt-0.5 block text-xs font-normal text-red-400">
                {user.is_blocked
                  ? "Restore their access to the portal."
                  : "Prevent them from signing in."}
              </span>
            </button>
            <button
              onClick={() => setShowDeleteDialog(true)}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2.5 text-left text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 shrink-0" />
                Delete this user
              </span>
              <span className="mt-0.5 block text-xs font-normal text-red-400">
                Permanent — this cannot be undone.
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Delete Dialog ── */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-gray-900">{user.email}</span>.
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting…" : "Delete user"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Block Dialog ── */}
      <Dialog open={showBlockDialog} onOpenChange={setShowBlockDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {user.is_blocked ? "Unblock user" : "Block user"}
            </DialogTitle>
            <DialogDescription>
              {user.is_blocked
                ? "This will restore access for "
                : "This will prevent "}
              <span className="font-semibold text-gray-900">{user.email}</span>
              {user.is_blocked ? "." : " from signing in."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBlockDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleToggleBlock}
              disabled={toggleBlockMutation.isPending}
              variant={user.is_blocked ? "default" : "destructive"}
            >
              {toggleBlockMutation.isPending
                ? "Updating…"
                : user.is_blocked
                  ? "Unblock"
                  : "Block"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
