"use client";

import { useState } from "react";
import { Edit, Eye, Trash2, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { RoleFormDialog } from "@/systems/ermp/components/admin/role-form-dialog";
import { RolePermissionsModal } from "@/systems/ermp/components/admin/role-permissions-modal";
import {
  useRolesList,
  usePermissionsList,
  useRoles,
  useRolePermissions,
} from "@/systems/ermp/hooks/admin/useRoles";
import type { Role, RoleCreate, RoleUpdate } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function RolesPage() {
  const rolesQuery = useRolesList();
  const permissionsQuery = usePermissionsList();
  const {
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    assignPermissionMutation,
    revokePermissionMutation,
  } = useRoles();

  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [permissionsModalOpen, setPermissionsModalOpen] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] =
    useState<Role | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRole, setDeletingRole] = useState<Role | null>(null);

  const rolePermissionsQuery = useRolePermissions(
    permissionsModalOpen && selectedRoleForPermissions
      ? selectedRoleForPermissions.id
      : 0,
  );

  const roles = rolesQuery.data ?? [];
  const permissions = permissionsQuery.data ?? [];
  const rolePermissions = rolePermissionsQuery.data ?? [];
  const isLoading = rolesQuery.isLoading || permissionsQuery.isLoading;

  const handleCreateRole = async (data: RoleCreate | RoleUpdate) => {
    await createRoleMutation.mutateAsync(data as RoleCreate);
    setFormDialogOpen(false);
    setEditingRole(null);
  };

  const handleUpdateRole = async (data: RoleCreate | RoleUpdate) => {
    if (!editingRole) return;
    await updateRoleMutation.mutateAsync({
      roleId: editingRole.id,
      payload: data as RoleUpdate,
    });
    setFormDialogOpen(false);
    setEditingRole(null);
  };

  const handleDeleteRole = async () => {
    if (!deletingRole) return;
    await deleteRoleMutation.mutateAsync(deletingRole.id);
    setDeleteDialogOpen(false);
    setDeletingRole(null);
  };

  const handleAssignPermission = async (permissionId: number) => {
    if (!selectedRoleForPermissions) return;
    await assignPermissionMutation.mutateAsync({
      roleId: selectedRoleForPermissions.id,
      permissionId,
    });
  };

  const handleRevokePermission = async (permissionId: number) => {
    if (!selectedRoleForPermissions) return;
    await revokePermissionMutation.mutateAsync({
      roleId: selectedRoleForPermissions.id,
      permissionId,
    });
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <section className="rounded-3xl border border-gray-200 bg-gradient-to-br from-violet-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-900 text-white">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Admin
              </p>
              <h1 className="text-xl font-semibold text-gray-900">Roles</h1>
              <p className="text-sm text-gray-500">
                Create and manage user roles and their permissions.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600">
              Total roles:{" "}
              <span className="font-semibold text-gray-900">
                {roles.length}
              </span>
            </div>
            <Button
              onClick={() => {
                setEditingRole(null);
                setFormDialogOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add role
            </Button>
          </div>
        </div>
      </section>

      {/* ── Table ── */}
      <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="pl-6 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Role
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Description
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Created
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Updated
              </TableHead>
              <TableHead className="text-center text-xs font-semibold uppercase tracking-wide text-gray-400">
                Permissions
              </TableHead>
              <TableHead className="pr-6 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent">
                  <TableCell className="pl-6">
                    <Skeleton className="h-4 w-24 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28 rounded" />
                  </TableCell>
                  <TableCell className="flex justify-center">
                    <Skeleton className="h-7 w-16 rounded" />
                  </TableCell>
                  <TableCell className="pr-6">
                    <Skeleton className="ml-auto h-7 w-16 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : roles.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-100">
                      <ShieldCheck className="h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-500">
                      No roles yet
                    </p>
                    <p className="text-xs text-gray-400">
                      Create your first role to get started.
                    </p>
                    <Button
                      size="sm"
                      className="mt-2 gap-2"
                      onClick={() => {
                        setEditingRole(null);
                        setFormDialogOpen(true);
                      }}
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add role
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id} className="group">
                  <TableCell className="pl-6">
                    <span className="text-sm font-semibold text-gray-900">
                      {role.name}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <span className="text-sm text-gray-500 line-clamp-1">
                      {role.description || (
                        <span className="text-gray-300">—</span>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(role.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(role.updated_at)}
                  </TableCell>
                  <TableCell className="text-center">
                    <button
                      onClick={() => {
                        setSelectedRoleForPermissions(role);
                        setPermissionsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </TableCell>
                  <TableCell className="pr-6">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => {
                          setEditingRole(role);
                          setFormDialogOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                        aria-label="Edit role"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setDeletingRole(role);
                          setDeleteDialogOpen(true);
                        }}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        aria-label="Delete role"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Dialogs ── */}
      <RoleFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        role={editingRole}
        onSubmit={editingRole ? handleUpdateRole : handleCreateRole}
        isLoading={createRoleMutation.isPending || updateRoleMutation.isPending}
      />

      {selectedRoleForPermissions && (
        <RolePermissionsModal
          open={permissionsModalOpen}
          onOpenChange={setPermissionsModalOpen}
          roleName={selectedRoleForPermissions.name}
          rolePermissions={rolePermissions}
          allPermissions={permissions}
          onAssignPermission={handleAssignPermission}
          onRevokePermission={handleRevokePermission}
          isLoadingAssign={assignPermissionMutation.isPending}
          isLoadingRevoke={revokePermissionMutation.isPending}
        />
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete role</DialogTitle>
            <DialogDescription>
              This will permanently delete{" "}
              <span className="font-semibold text-gray-900">
                {deletingRole?.name}
              </span>
              . This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteRole}
              disabled={deleteRoleMutation.isPending}
            >
              {deleteRoleMutation.isPending ? "Deleting…" : "Delete role"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
