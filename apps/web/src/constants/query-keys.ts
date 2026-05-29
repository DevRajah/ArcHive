export const QUERY_KEYS = {
  DASHBOARD_SUMMARY: ["dashboard-summary"],
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
};