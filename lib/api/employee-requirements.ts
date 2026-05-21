import axios from "axios";
import type { EmployeeRequirementsResponse } from "@/lib/types";

const EXTERNAL_API_URL = "https://cmiitdept.com/hr/api_onboarded_minor.php";

// Create a separate axios instance for external API (no auth headers, no interceptors)
const externalApiClient = axios.create({
  headers: { "Content-Type": "application/json" },
});

export const employeeRequirementsApi = {
  fetchAll: async (
    limit?: number,
    offset?: number,
  ): Promise<EmployeeRequirementsResponse> => {
    try {
      const params = new URLSearchParams();
      if (limit) params.append("limit", limit.toString());
      if (offset) params.append("offset", offset.toString());

      const url = params.toString()
        ? `${EXTERNAL_API_URL}?${params.toString()}`
        : EXTERNAL_API_URL;

      const { data } =
        await externalApiClient.get<EmployeeRequirementsResponse>(url);
      return data;
    } catch (error) {
      console.error("Failed to fetch employee requirements:", error);
      throw error;
    }
  },
};
