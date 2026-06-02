import { useQuery } from "@tanstack/react-query";
import { employeeRequirementsApi } from "@/lib/api/employee-requirements";
import { useEmployeeRequirementsStore } from "@/store/employee-requirements.store";
import { toast } from "sonner";

export const useEmployeeRequirements = (limit?: number, offset?: number) => {
  const { setRequirements, setLoading, setError } =
    useEmployeeRequirementsStore();

  const query = useQuery({
    queryKey: ["employee-requirements", limit, offset],
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
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnReconnect: true, // Refetch when connection restored
  });

  return query;
};
