import { OrganizationIntelligenceQuery } from "@/types/organization.types";

export const QUERY_KEYS = {
  DASHBOARD_SUMMARY: ["dashboard-summary"],

  QUEUE_METRICS: ["queue-metrics"],

  QUEUE_RECENT_JOBS: ["queue-recent-jobs"],

  INTELLIGENCE_OVERVIEW: [
    "intelligence-overview",
  ],


  INTELLIGENCE_SEARCH: (params: {
    query?: string;
    repositoryType?: string;
    domain?: string;
    technology?: string;
  }) => ["intelligence-search", params],

  PORTFOLIO_KNOWLEDGE_GRAPH: (
    userId: string
  ) => [
      "portfolio-knowledge-graph",
      userId,
    ],

  PORTFOLIO_TECHNOLOGIES: (
    userId: string
  ) => [
      "portfolio-technologies",
      userId,
    ],

  PORTFOLIO_TECHNOLOGY_DETAIL: (
    userId: string,
    technology: string
  ) => [
      "portfolio-technology-detail",
      userId,
      technology,
    ],

  REPOSITORIES: ["repositories"],

  GITHUB_REPOSITORIES: [
    "github-repositories",
  ],

  REPOSITORY_OVERVIEW: (
    repositoryId: string
  ) => [
      "repository-overview",
      repositoryId,
    ],

  REPOSITORY_TIMELINE: (
    repositoryId: string
  ) => [
      "repository-timeline",
      repositoryId,
    ],

  REPOSITORY_ARCHITECTURE: (
    repositoryId: string
  ) => [
      "repository-architecture",
      repositoryId,
    ],

  ARCHITECTURE_EVOLUTION: (
    repositoryId: string
  ) => [
      "architecture-evolution",
      repositoryId,
    ],

  REPOSITORY_CAPABILITIES: (
    repositoryId: string
  ) => [
      "repository-capabilities",
      repositoryId,
    ],

  REPOSITORY_ARCHITECTURE_RADAR: (
    repositoryId: string
  ) => [
      "repository-architecture-radar",
      repositoryId,
    ],

  REPOSITORY_NARRATIVE: (
    repositoryId: string
  ) => [
      "repository-narrative",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_SUMMARY: (
    repositoryId: string
  ) => [
      "repository-intelligence-summary",
      repositoryId,
    ],

  REPOSITORY_PURPOSE: (
    repositoryId: string
  ) => [
      "repository-purpose",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_REPORT: (
    repositoryId: string
  ) => [
      "repository-intelligence-report",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_TIMELINE: (
    repositoryId: string
  ) => [
      "repository-intelligence-timeline",
      repositoryId,
    ],

  REPOSITORY_RELATED: (
    repositoryId: string
  ) => [
      "repository-related",
      repositoryId,
    ],

  REPOSITORY_COMPARISON: (
    repositoryId: string,
    targetRepositoryId: string
  ) => [
      "repository-comparison",
      repositoryId,
      targetRepositoryId,
    ],

  REPOSITORY_KNOWLEDGE_GRAPH: (
    repositoryId: string
  ) => [
      "repository-knowledge-graph",
      repositoryId,
    ],

  REPOSITORY_ENGINEERING_REASONING: (
    repositoryId: string
  ) => [
      "repository-engineering-reasoning",
      repositoryId,
    ],

  REPOSITORY_RECOMMENDATIONS: (
    repositoryId: string
  ) => [
      "repository-recommendations",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_AUDIT: (
    repositoryId: string
  ) => [
      "repository-intelligence-audit",
      repositoryId,
    ],

  REPOSITORY_SEMANTIC_PROFILE: (
    repositoryId: string
  ) => [
      "repository-semantic-profile",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_MARKDOWN: (
    repositoryId: string
  ) => [
      "repository-intelligence-markdown",
      repositoryId,
    ],

  REPOSITORY_INTELLIGENCE_DIFF: (
    repositoryId: string
  ) => [
      "repository-intelligence-diff",
      repositoryId,
    ],

  ORGANIZATION_DASHBOARD: (
    userId: string,
    query?: OrganizationIntelligenceQuery
  ) => [
      "organization-dashboard",
      userId,
      query,
    ],

  REPROCESS_REPOSITORIES: [
    "reprocess-repositories",
  ],
};