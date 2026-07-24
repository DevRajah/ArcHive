export type RepositoryHealthDirection =
  | "IMPROVING"
  | "STABLE"
  | "DECLINING"
  | "UNKNOWN";

export type RepositoryHealthRiskLevel =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "UNKNOWN";

export type RepositoryHealthMetricKey =
  | "overallHealth"
  | "architecture"
  | "engineeringQuality"
  | "productionReadiness"
  | "capability"
  | "maturity"
  | "confidence"
  | "risk";

export type RepositoryHealthChangeDirection =
  | "INCREASED"
  | "DECREASED"
  | "UNCHANGED"
  | "IMPROVED"
  | "DECLINED"
  | "UNKNOWN";

/*
 * A score returned by the backend may be represented on either a 0-1
 * scale or a 0-100 scale. The UI normalises both formats before display.
 */
export interface RepositoryHealthMetric {
  score: number;
  previousScore: number | null;
  delta: number | null;
  direction?: RepositoryHealthDirection | RepositoryHealthChangeDirection;
  explanation?: string;
}

export interface RepositoryHealthScoreBreakdown {
  architecture: RepositoryHealthMetric;
  engineeringQuality: RepositoryHealthMetric;
  productionReadiness: RepositoryHealthMetric;
  capability: RepositoryHealthMetric;
  maturity: RepositoryHealthMetric;
  confidence: RepositoryHealthMetric;
  risk: RepositoryHealthMetric;
  overallHealth: RepositoryHealthMetric;
}

export interface RepositoryHealthInsight {
  id?: string;
  title: string;
  description: string;
  category?: string;
  severity?: RepositoryHealthRiskLevel;
  recommendation?: string;
  evidence?: string[] | string;
}

export interface RepositoryHealthSnapshot {
  snapshotId: string;
  advisorSnapshotId: string | null;

  recordedAt: string;

  architecture: number;
  engineeringQuality: number;
  productionReadiness: number;
  capability: number;
  maturity: number;
  confidence: number;
  risk: number;
  health: number;
}

export interface RepositoryHealthSummary {
  repositoryId?: string;
  repositoryName?: string;

  overallHealthScore: number;
  previousOverallHealthScore: number | null;
  overallHealthDelta: number | null;

  direction: RepositoryHealthDirection;
  confidenceScore: number;
  riskScore: number;
  riskLevel: RepositoryHealthRiskLevel;

  scoreBreakdown: RepositoryHealthScoreBreakdown;

  insights: RepositoryHealthInsight[];

  snapshotCount?: number;
  hasEnoughHistory?: boolean;

  generatedAt?: string;
  lastUpdatedAt?: string;
}

export interface RepositoryHealthTrendResponse {
  repositoryId?: string;
  repositoryName?: string;

  summary: RepositoryHealthSummary;
  latestSnapshot?: RepositoryHealthSnapshot | null;
  history?: RepositoryHealthSnapshot[];
  insights?: RepositoryHealthInsight[];

  generatedAt?: string;
}

export interface RepositoryHealthHistoryResponse {
  repositoryId?: string;
  repositoryName?: string;
  history: RepositoryHealthSnapshot[];
  snapshotCount?: number;
}

export interface RepositoryHealthChange {
  id?: string;
  repositoryId?: string;

  metric: string;
  previousValue: number | string | null;
  currentValue: number | string | null;
  delta?: number | null;

  direction: RepositoryHealthChangeDirection;

  summary: string;
  timestamp?: string;
  createdAt?: string;
  detectedAt?: string;
}

export interface RepositoryHealthChangesResponse {
  repositoryId?: string;
  repositoryName?: string;
  changes: RepositoryHealthChange[];
}

export interface RepositoryHealthRefreshResponse {
  repositoryId?: string;
  message?: string;
  summary?: RepositoryHealthSummary;
  snapshot?: RepositoryHealthSnapshot;
  healthTrends?: RepositoryHealthTrendResponse;
}