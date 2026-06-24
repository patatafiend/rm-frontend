import { apiClient } from "./client";
import type { Role, RoleCreate, RoleUpdate, Permission, RolePermissionRead } from "@/lib/types";

const ROLES_PATH = "/roles";

export interface RolesListParams {
  company_id?: number;
  client_id?: number;
  account_type?: string;
}

export const rolesApi = {
  list: async (params: RolesListParams = {}): Promise<Role[]> => {
    const { data } = await apiClient.get<Role[]>(ROLES_PATH, { params });
    return data;
  },

  get: async (roleId: number): Promise<Role> => {
    const { data } = await apiClient.get<Role>(`${ROLES_PATH}/${roleId}`);
    return data;
  },

  create: async (payload: RoleCreate): Promise<Role> => {
    const { data } = await apiClient.post<Role>(ROLES_PATH, payload);
    return data;
  },

  update: async (roleId: number, payload: RoleUpdate): Promise<Role> => {
    const { data } = await apiClient.put<Role>(`${ROLES_PATH}/${roleId}`, payload);
    return data;
  },

  delete: async (roleId: number): Promise<void> => {
    await apiClient.delete(`${ROLES_PATH}/${roleId}`);
  },

  getPermissions: async (roleId: number): Promise<RolePermissionRead[]> => {
    const { data } = await apiClient.get<RolePermissionRead[]>(`${ROLES_PATH}/${roleId}/permissions`);
    return data;
  },

  assignPermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.post(`${ROLES_PATH}/${roleId}/permissions`, { permission_id: permissionId });
  },

  revokePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await apiClient.delete(`${ROLES_PATH}/${roleId}/permissions/${permissionId}`);
  },
};
