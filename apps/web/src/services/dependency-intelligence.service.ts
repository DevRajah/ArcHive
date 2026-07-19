import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

import type {
  DependencyOverview,
  TechnologyDependencyDetail,
  TechnologyImpactReport,
} from "@/types/dependency-intelligence.types";

function safeArray<T>(value?: T[] | null): T[] {
  return Array.isArray(value) ? value : [];
}

function normalizeOverview(
  data: DependencyOverview
): DependencyOverview {
  return {
    ...data,

    technologies: safeArray(data.technologies).map((technology) => ({
      ...technology,
      repositoryCount: technology.repositoryCount ?? 0,
      trackedRepositoryCount:
        technology.trackedRepositoryCount ?? 0,
      connectedTechnologyCount:
        technology.connectedTechnologyCount ?? 0,
      dependentTechnologies: safeArray(
        technology.dependentTechnologies
      ),
      dependedOnBy: safeArray(technology.dependedOnBy),
      architectureDomains: safeArray(
        technology.architectureDomains
      ),
      repositoryTypes: safeArray(technology.repositoryTypes),
      capabilities: safeArray(technology.capabilities),
      centralityScore: technology.centralityScore ?? 0,
      impactScore: technology.impactScore ?? 0,
      riskLevel: technology.riskLevel || "LOW",
    })),

    relationships: safeArray(data.relationships).map(
      (relationship) => ({
        ...relationship,
        sharedRepositories: relationship.sharedRepositories ?? 0,
        sourceRepositoryCoverage:
          relationship.sourceRepositoryCoverage ?? 0,
        targetRepositoryCoverage:
          relationship.targetRepositoryCoverage ?? 0,
        strength: relationship.strength ?? 0,
        sharedRepositoryIds: safeArray(
          relationship.sharedRepositoryIds
        ),
        sharedRepositoryNames: safeArray(
          relationship.sharedRepositoryNames
        ),
      })
    ),

    summary: {
      totalRepositories: data.summary?.totalRepositories ?? 0,
      trackedRepositories: data.summary?.trackedRepositories ?? 0,
      totalTechnologies: data.summary?.totalTechnologies ?? 0,
      totalRelationships: data.summary?.totalRelationships ?? 0,
      mostCentralTechnology:
        data.summary?.mostCentralTechnology ?? null,
      highestImpactTechnology:
        data.summary?.highestImpactTechnology ?? null,
      strongestRelationship:
        data.summary?.strongestRelationship ?? null,
      criticalTechnologies:
        data.summary?.criticalTechnologies ?? 0,
      highRiskTechnologies:
        data.summary?.highRiskTechnologies ?? 0,
    },
  };
}

function normalizeDetail(
  data: TechnologyDependencyDetail
): TechnologyDependencyDetail {
  return {
    ...data,
    repositories: safeArray(data.repositories),
    relationships: safeArray(data.relationships),
    relatedTechnologies: safeArray(data.relatedTechnologies),
    architectureDomains: safeArray(data.architectureDomains),
    repositoryTypes: safeArray(data.repositoryTypes),
    capabilities: safeArray(data.capabilities),
  };
}

function normalizeImpact(
  data: TechnologyImpactReport
): TechnologyImpactReport {
  return {
    ...data,
    affectedRepositories: safeArray(data.affectedRepositories),
    relatedTechnologies: safeArray(data.relatedTechnologies),
    architectureDomains: safeArray(data.architectureDomains),
    repositoryTypes: safeArray(data.repositoryTypes),
    capabilities: safeArray(data.capabilities),
    warnings: safeArray(data.warnings),
  };
}

export const dependencyIntelligenceService = {
  async getDependencyOverview(
    userId: string
  ): Promise<DependencyOverview> {
    const response = await api.get<ApiResponse<DependencyOverview>>(
      `/users/${userId}/dependencies`
    );

    return normalizeOverview(response.data.data);
  },

  async getTechnologyDependencyDetail(
    userId: string,
    technology: string
  ): Promise<TechnologyDependencyDetail> {
    const response = await api.get<
      ApiResponse<TechnologyDependencyDetail>
    >(
      `/users/${userId}/dependencies/${encodeURIComponent(
        technology
      )}`
    );

    return normalizeDetail(response.data.data);
  },

  async getTechnologyImpact(
    userId: string,
    technology: string
  ): Promise<TechnologyImpactReport> {
    const response = await api.get<ApiResponse<TechnologyImpactReport>>(
      `/users/${userId}/impact/${encodeURIComponent(technology)}`
    );

    return normalizeImpact(response.data.data);
  },
};