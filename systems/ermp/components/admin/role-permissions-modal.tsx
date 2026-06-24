"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, X, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Permission } from "@/lib/types";

interface RolePermissionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleName: string;
  rolePermissions: Permission[];
  allPermissions: Permission[];
  onAssignPermission: (permissionId: number) => Promise<void>;
  onRevokePermission: (permissionId: number) => Promise<void>;
  isLoadingAssign?: boolean;
  isLoadingRevoke?: boolean;
}

export function RolePermissionsModal({
  open,
  onOpenChange,
  roleName,
  rolePermissions,
  allPermissions,
  onAssignPermission,
  onRevokePermission,
  isLoadingAssign = false,
  isLoadingRevoke = false,
}: RolePermissionsModalProps) {
  const [selectedPermissionId, setSelectedPermissionId] = useState<string>("");

  const assignedPermissionIds = new Set(rolePermissions.map((p) => p.id));
  const availablePermissions = allPermissions.filter(
    (p) => !assignedPermissionIds.has(p.id)
  );

  const handleAssign = async () => {
    if (!selectedPermissionId) {
      toast.error("Please select a permission");
      return;
    }

    try {
      await onAssignPermission(Number(selectedPermissionId));
      setSelectedPermissionId("");
      toast.success("Permission assigned");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to assign permission";
      toast.error(message);
    }
  };

  const handleRevoke = async (permissionId: number) => {
    try {
      await onRevokePermission(permissionId);
      toast.success("Permission removed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to revoke permission";
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[600px] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Permissions</DialogTitle>
          <DialogDescription>
            Permissions for role: <span className="font-medium text-foreground">{roleName}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Assigned Permissions ({rolePermissions.length})</h3>
            <div className="space-y-2 max-h-[250px] overflow-y-auto border rounded-md p-3 bg-slate-50">
              {rolePermissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No permissions assigned yet</p>
              ) : (
                rolePermissions.map((permission) => (
                  <div
                    key={permission.id}
                    className="flex items-center justify-between bg-white p-2 rounded border"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium">
                        {permission.resource}:{permission.action}
                      </div>
                      {permission.description && (
                        <div className="text-xs text-muted-foreground">
                          {permission.description}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRevoke(permission.id)}
                      disabled={isLoadingRevoke}
                      className="ml-2 h-8 w-8 p-0"
                    >
                      {isLoadingRevoke ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Add Permission</h3>
            <div className="flex gap-2">
              <Select value={selectedPermissionId} onValueChange={setSelectedPermissionId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a permission to add" />
                </SelectTrigger>
                <SelectContent>
                  {availablePermissions.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">
                      All permissions already assigned
                    </div>
                  ) : (
                    availablePermissions.map((permission) => (
                      <SelectItem key={permission.id} value={String(permission.id)}>
                        <div className="flex items-center gap-2">
                          <span>{permission.resource}:{permission.action}</span>
                          {permission.description && (
                            <span className="text-xs text-muted-foreground">
                              ({permission.description})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAssign}
                disabled={isLoadingAssign || !selectedPermissionId}
                size="sm"
              >
                {isLoadingAssign ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Plus className="h-4 w-4 mr-2" />
                )}
                Add
              </Button>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
