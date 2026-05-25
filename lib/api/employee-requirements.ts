import { apiClient } from "./client";
import type { EmployeeRequirementsResponse } from "@/lib/types";

const EMPLOYEE_REQUIREMENTS_PATH = "/employee-requirements";

export const employeeRequirementsApi = {
  fetchAll: async (
    limit?: number,
    offset?: number,
  ): Promise<EmployeeRequirementsResponse> => {
    try {
      const { data } = await apiClient.get<EmployeeRequirementsResponse>(
        EMPLOYEE_REQUIREMENTS_PATH,
        { params: { limit, offset } },
      );
      return data;
    } catch (error) {
      console.error("Failed to fetch employee requirements:", error);
      throw error;
    }
  },
};
