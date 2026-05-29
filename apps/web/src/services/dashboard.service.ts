import { api } from "@/lib/api";
import { getUserId } from "@/lib/auth";
import { ApiResponse } from "@/types/api.types";
import { DashboardSummary } from "@/types/dashboard.types";

function requireUserId() {
  const userId = getUserId();

  if (!userId) {
    throw new Error(
      "No ArcHive user ID found. Please connect GitHub or set NEXT_PUBLIC_DEV_USER_ID."
    );
  }

  return userId;
}

export const dashboardService = {
  async getDashboardSummary() {
    const response = await api.get<ApiResponse<DashboardSummary>>(
      `/users/${requireUserId()}/dashboard`
    );

    return response.data.data;
  },
};