import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/roles";
import { permissionsApi } from "@/lib/api/permissions";
import type { RoleCreate, RoleUpdate } from "@/lib/types";
import { toast } from "sonner";

// Query Hooks
export function useRolesList() {
  return useQuery({
    queryKey: ["roles"],
    queryFn: () => rolesApi.list(),
  });
}

export function useRoleDetail(roleId: number) {
  return useQuery({
    queryKey: ["roles", roleId],
    queryFn: () => rolesApi.get(roleId),
    enabled: !!roleId,
  });
}

export function useRolePermissions(roleId: number) {
  return useQuery({
    queryKey: ["roles", roleId, "permissions"],
    queryFn: async () => {
      const result = await rolesApi.getPermissions(roleId);
      // Transform RolePermissionRead[] to Permission[] by extracting nested permission objects
      return result.map((rp) => rp.permission);
    },
    enabled: !!roleId,
  });
}

export function usePermissionsList() {
  return useQuery({
    queryKey: ["permissions"],
    queryFn: () => permissionsApi.list(),
  });
}

// Mutation Hooks
export function useRoles() {
  const queryClient = useQueryClient();

  const createRoleMutation = useMutation({
    mutationFn: (payload: RoleCreate) => rolesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role created successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to create role");
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({
      roleId,
      payload,
    }: {
      roleId: number;
      payload: RoleUpdate;
    }) => rolesApi.update(roleId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      queryClient.invalidateQueries({ queryKey: ["roles", data.id] });
      toast.success("Role updated successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to update role");
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: number) => rolesApi.delete(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      toast.success("Role deleted successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to delete role");
    },
  });

  const assignPermissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => rolesApi.assignPermission(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
      toast.success("Permission assigned successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to assign permission");
    },
  });

  const revokePermissionMutation = useMutation({
    mutationFn: ({
      roleId,
      permissionId,
    }: {
      roleId: number;
      permissionId: number;
    }) => rolesApi.revokePermission(roleId, permissionId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["roles", variables.roleId, "permissions"],
      });
      toast.success("Permission revoked successfully");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to revoke permission");
    },
  });

  return {
    createRoleMutation,
    updateRoleMutation,
    deleteRoleMutation,
    assignPermissionMutation,
    revokePermissionMutation,
  };
}
