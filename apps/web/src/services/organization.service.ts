import { api } from "@/lib/api";

import type {
  OrganizationIntelligenceQuery,
  OrganizationIntelligenceResponse,
  ReprocessAllRepositoriesResponse,
} from "@/types/organization.types";

class OrganizationService {
  /**
   * Fetches the complete Organization Intelligence dashboard.
   *
   * The backend returns:
   * - overview
   * - rankings
   * - technology inventory
   * - recommendations
   * - risks
   * - activity timeline
   * - trends
   */
  async getOrganizationIntelligence(
    userId: string,
    query?: OrganizationIntelligenceQuery
  ): Promise<OrganizationIntelligenceResponse> {
    const { data } = await api.get<OrganizationIntelligenceResponse>(
      `/api/users/${userId}/organization-intelligence`,
      {
        params: query,
      }
    );

    return data;
  }

  /**
   * Reprocesses every tracked repository.
   *
   * This regenerates repository intelligence across the user's portfolio.
   *
   * NOTE:
   * This endpoint can be expensive.
   * It should only be triggered when the user explicitly clicks
   * "Reprocess All Repositories".
   */
  async reprocessRepositories(): Promise<ReprocessAllRepositoriesResponse> {
    const { data } = await api.post<ReprocessAllRepositoriesResponse>(
      "/api/repositories/reprocess-all"
    );

    return data;
  }
}

export const organizationService = new OrganizationService();