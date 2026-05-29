import { api } from "@/lib/api";
import { ApiResponse } from "@/types/api.types";
import { DashboardSummary } from "@/types/dashboard.types";

export const dashboardService = {
  async getDashboardSummary() {
    const response = await api.get<ApiResponse<DashboardSummary>>(
      "/dashboard/summary"
    );

    return response.data.data;
  },
};