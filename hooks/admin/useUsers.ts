import { useQuery, useMutation } from "@tanstack/react-query";
import { rolesApi } from "@/lib/api/roles";
import { usersApi } from "@/lib/api/users";
import { useUsersStore } from "@/store/users.store";
import type { AdminUserUpdate } from "@/lib/types";

export function useUsers() {
  const {
    page,
    pageSize,
    filters,
    setUsers,
    setLoading,
    setError,
    setRoleMap,
    getQueryParams,
  } = useUsersStore();

  const usersQuery = useQuery({
    queryKey: [
      "users",
      page,
      pageSize,
      filters.search,
      filters.accountType,
      filters.blocked,
    ],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await usersApi.list(getQueryParams());
        setUsers(data);
        return data;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to fetch users";
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    retry: 1,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });

  const rolesQuery = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const roles = await rolesApi.list();
      const map: Record<number, string> = {};
      roles.forEach((role) => {
        map[role.id] = role.name;
      });
      setRoleMap(map);
      return roles;
    },
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  // Query hook for fetching single user details
  const useUserDetail = (userId: number) => {
    return useQuery({
      queryKey: ["users", userId],
      queryFn: () => usersApi.get(userId),
      enabled: !!userId,
      staleTime: 30 * 1000,
      gcTime: 5 * 60 * 1000,
    });
  };

  // Mutation for updating user
  const updateUserMutation = useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: number;
      payload: AdminUserUpdate;
    }) => usersApi.update(userId, payload),
    onSuccess: () => {
      // Refetch the users list to keep it in sync
      usersQuery.refetch();
    },
  });

  // Mutation for deleting user
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => usersApi.delete(userId),
    onSuccess: () => {
      // Refetch the users list
      usersQuery.refetch();
    },
  });

  // Mutation for toggling block status
  const toggleBlockMutation = useMutation({
    mutationFn: (userId: number) => usersApi.toggleBlock(userId),
    onSuccess: () => {
      // Refetch the users list
      usersQuery.refetch();
    },
  });

  return {
    usersQuery,
    rolesQuery,
    useUserDetail,
    updateUserMutation,
    deleteUserMutation,
    toggleBlockMutation,
  };
}
