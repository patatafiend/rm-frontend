import { useQuery } from "@tanstack/react-query";
import { employeeRequirementsApi } from "@/lib/api/employee-requirements";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { toast } from "sonner";
import { useAuthStore } from "@/store/auth.store";

export const useEmployeeRequirements = (limit?: number, offset?: number) => {
  const { setRequirements, setLoading, setError } =
    useEmployeeRequirementsStore();
    const { accessToken } = useAuthStore(); 

  const query = useQuery({
    queryKey: ["employee-requirements", limit, offset, accessToken],
    queryFn: async () => {
      setLoading(true);
      try {
        const response = await employeeRequirementsApi.fetchAll(limit, offset);
        if (response.status === "success") {
          setRequirements(response.data);
          return response;
        } else {
          throw new Error("API returned error status");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch requirements";
        setError(errorMessage);
        toast.error(errorMessage);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // Auto-refetch every 5 minutes seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when connection restored
  });

  return query;
};
