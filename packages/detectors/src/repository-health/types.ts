export type RepositoryHealthStatus =
  | "HEALTHY"
  | "STABLE"
  | "AT_RISK"
  | "CRITICAL";

export type RepositoryHealth = {
  score: number;
  status: RepositoryHealthStatus;
  summary: string;
  highlights: string[];
  concerns: string[];
};