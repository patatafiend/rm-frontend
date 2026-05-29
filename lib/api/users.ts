import { apiClient } from "./client";
import type {
  UsersListResponse,
  AdminUserCreate,
  AdminUserUpdate,
  UserCreateResponse,
  User,
} from "@/lib/types";

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
  get: async (userId: number): Promise<User> => {
    const { data } = await apiClient.get<User>(`${USERS_PATH}/${userId}`);
    return data;
  },
  create: async (payload: AdminUserCreate): Promise<UserCreateResponse> => {
    const { data } = await apiClient.post<UserCreateResponse>(
      USERS_PATH,
      payload,
    );
    return data;
  },
  update: async (userId: number, payload: AdminUserUpdate): Promise<User> => {
    const { data } = await apiClient.put<User>(
      `${USERS_PATH}/${userId}`,
      payload,
    );
    return data;
  },
  delete: async (userId: number): Promise<void> => {
    await apiClient.delete(`${USERS_PATH}/${userId}`);
  },
  toggleBlock: async (userId: number): Promise<User> => {
    const { data } = await apiClient.patch<User>(
      `${USERS_PATH}/${userId}/block`,
    );
    return data;
  },
};
