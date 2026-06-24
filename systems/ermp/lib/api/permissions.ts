import { apiClient } from "./client";
import type { Permission } from "@/lib/types";

const PERMISSIONS_PATH = "/permissions";

export const permissionsApi = {
  list: async (): Promise<Permission[]> => {
    const { data } = await apiClient.get<Permission[]>(PERMISSIONS_PATH);
    return data;
  },
};
