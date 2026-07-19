export interface TechnologyIntelligenceUser {
    id: string;
    username?: string | null;
    avatarUrl?: string | null;
}

export interface TechnologySummaryItem {
    technology: string;
    repositoryCount: number;
    trackedRepositoryCount: number;
    architectureDomainCount: number;
    capabilityCount: number;
    recommendationCount: number;
    firstDetectedAt: string | null;
    lastDetectedAt: string | null;
}

export interface TechnologySummary {
    totalTechnologies: number;
    totalRepositoryTechnologyLinks: number;
    mostAdoptedTechnology: TechnologySummaryItem | null;
    newestTechnology: TechnologySummaryItem | null;
    technologiesWithRecommendations: number;
}

export interface TechnologyIntelligenceOverviewItem {
    technology: string;
    repositoryCount: number;
    trackedRepositoryCount: number;
    architectureDomainCount: number;
    capabilityCount: number;
    recommendationCount: number;
    firstDetectedAt: string | null;
    lastDetectedAt: string | null;
}

export interface TechnologyIntelligenceOverview {
    user: TechnologyIntelligenceUser;
    summary: TechnologySummary;
    technologies: TechnologyIntelligenceOverviewItem[];
}

export interface TechnologyIntelligenceDetailSummary {
    name: string;
    repositoryCount: number;
    trackedRepositoryCount: number;
    architectureDomainCount: number;
    repositoryTypeCount: number;
    capabilityCount: number;
    recommendationCount: number;
    firstDetectedAt: string | null;
    lastDetectedAt: string | null;
}

export interface TechnologyNamedCount {
    name: string;
    count: number;
}

export interface TechnologyIntelligenceRepository {
    id: string;
    name: string;
    fullName?: string | null;
    language?: string | null;
    isTracked?: boolean;

    firstDetectedAt?: string | null;
    lastDetectedAt?: string | null;

    matchingArchitectureChanges?: number;
    matchingRecommendations?: number;

    architectureDomains?: string[];
    repositoryTypes?: string[];
    capabilities?: string[];
}

export interface TechnologyAdoptionPoint {
    period: string;
    newlyAdoptedRepositories: number;
    cumulativeRepositories: number;
}

export interface TechnologyRecommendation {
    id: string;

    repository: {
        id: string;
        name?: string | null;
        fullName?: string | null;
    } | null;

    title: string;
    description?: string | null;
    status: string;
    evidence?: string | null;
    createdAt?: string | null;
    resolvedAt?: string | null;
}

export interface TechnologyDetectionHistoryItem {
    id: string;

    repository: {
        id: string;
        name?: string | null;
        fullName?: string | null;
    } | null;

    architectureDomain?: string | null;
    summary?: string | null;
    fileAffected?: string | null;
    detectedAt: string;
}

export interface RelatedTechnology {
  name: string;
  sharedRepositoryCount: number;
}

export interface TechnologyIntelligenceDetail {
    user: TechnologyIntelligenceUser;

    technology: TechnologyIntelligenceDetailSummary;

    repositories: TechnologyIntelligenceRepository[];

    architectureDomains: TechnologyNamedCount[];

    repositoryTypes: TechnologyNamedCount[];

    capabilities: TechnologyNamedCount[];

    recommendations: TechnologyRecommendation[];

    detectionHistory: TechnologyDetectionHistoryItem[];

    adoptionTimeline: TechnologyAdoptionPoint[];

    relatedTechnologies: RelatedTechnology[];
}

export type TechnologyOverviewSort =
    | "MOST_USED"
    | "LEAST_USED"
    | "NEWEST"
    | "OLDEST"
    | "MOST_RECOMMENDATIONS"
    | "ALPHABETICAL";