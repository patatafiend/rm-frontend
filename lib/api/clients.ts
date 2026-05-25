import { apiClient } from "./client";
import type { PaginatedClients } from "@/lib/types";

const CLIENTS_PATH = "/clients";

export interface ClientsListParams {
  page?: number;
  page_size?: number;
  company_id?: number;
  system_type?: string;
  status?: string;
  is_blocked?: boolean;
  search?: string;
}

export const clientsApi = {
  list: async (params: ClientsListParams): Promise<PaginatedClients> => {
    const { data } = await apiClient.get<PaginatedClients>(CLIENTS_PATH, {
      params,
    });
    return data;
  },
};
