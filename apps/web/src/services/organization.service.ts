import { api } from "@/lib/api";

import type {
  OrganizationIntelligenceResponse,
  ReprocessAllRepositoriesResponse,
} from "@/types/organization.types";

class OrganizationService {
  /**
   * Fetches the complete Organization Dashboard.
   *
   * Backend endpoint:
   * GET /users/:userId/organization/dashboard
   *
   * Returns:
   * - overview
   * - rankings
   * - technology
   * - recommendations
   * - risks
   * - activity
   * - trends
   */
  async getOrganizationDashboard(
    userId: string,
  ): Promise<OrganizationIntelligenceResponse> {
    const { data } =
      await api.get<OrganizationIntelligenceResponse>(
        `/users/${userId}/organization/dashboard`,
      );

    return data;
  }

  /**
   * Reprocess every tracked repository.
   *
   * This queues all repositories for fresh analysis so the
   * Organization Dashboard reflects the latest engineering data.
   */
  async reprocessRepositories(): Promise<ReprocessAllRepositoriesResponse> {
    const { data } =
      await api.post<ReprocessAllRepositoriesResponse>(
        "/repositories/reprocess-all",
      );

    return data;
  }
}

export const organizationService =
  new OrganizationService();