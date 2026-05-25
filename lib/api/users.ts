import { apiClient } from "./client";
import type { UsersListResponse, AdminUserCreate, UserCreateResponse } from "@/lib/types";

const USERS_PATH = "/users";

export interface UsersListParams {
  page?: number;
  page_size?: number;
  account_type?: string;
  is_blocked?: boolean;
  search?: string;
}

export const usersApi = {
  list: async (params: UsersListParams): Promise<UsersListResponse> => {
    const { data } = await apiClient.get<UsersListResponse>(USERS_PATH, {
      params,
    });
    return data;
  },
  create: async (payload: AdminUserCreate): Promise<UserCreateResponse> => {
    const { data } = await apiClient.post<UserCreateResponse>(USERS_PATH, payload);
    return data;
  },
};
