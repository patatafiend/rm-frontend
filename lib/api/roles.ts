import { apiClient } from "./client";
import type { Role } from "@/lib/types";

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
};
