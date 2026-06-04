export const QUERY_KEYS = {
  DASHBOARD_SUMMARY: ["dashboard-summary"],
  QUEUE_METRICS: ["queue-metrics"],
  QUEUE_RECENT_JOBS: ["queue-recent-jobs"],

  REPOSITORIES: ["repositories"],
  GITHUB_REPOSITORIES: ["github-repositories"],

  REPOSITORY_OVERVIEW: (repositoryId: string) => [
    "repository-overview",
    repositoryId,
  ],

  REPOSITORY_TIMELINE: (repositoryId: string) => [
    "repository-timeline",
    repositoryId,
  ],

  REPOSITORY_ARCHITECTURE: (repositoryId: string) => [
    "repository-architecture",
    repositoryId,
  ],

  ARCHITECTURE_EVOLUTION: (repositoryId: string) => [
    "architecture-evolution",
    repositoryId,
  ],

  REPOSITORY_CAPABILITIES: (repositoryId: string) => [
    "repository-capabilities",
    repositoryId,
  ],
};