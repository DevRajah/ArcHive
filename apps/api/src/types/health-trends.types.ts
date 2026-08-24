/*
|--------------------------------------------------------------------------
| Repository Health Trends Types
|--------------------------------------------------------------------------
|
| These types define the contracts used by ArcHive's Repository Health
| Trends engine.
|
| Health Trends never invent new repository data.
|
| Every trend is calculated from immutable evidence already stored by
| ArcHive:
|
| • Repository Intelligence Snapshots
| • Architecture Advisor Snapshots
| • Architecture Changes
| • Engineering Recommendations
|
|--------------------------------------------------------------------------
*/

export type RepositoryTrendDirection =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "INSUFFICIENT_DATA";

export type TrendDirection =
  | "UP"
  | "DOWN"
  | "STABLE"
  | "INSUFFICIENT_DATA";

export type RiskLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL"
  | "UNASSESSED";

export interface HealthMetricTrend {
  current: number | null;

  previous: number | null;

  change: number | null;

  percentageChange: number | null;

  direction: TrendDirection;

  status: RepositoryTrendDirection;
}

export interface RepositoryHealthSummary {
  direction: RepositoryTrendDirection;

  healthScore: number | null;

  previousHealthScore: number | null;

  healthScoreChange: number | null;

  maturity: string;

  riskLevel: RiskLevel;

  confidenceScore: number | null;

  snapshotCount: number;

  firstRecordedAt: Date | null;

  lastRecordedAt: Date | null;
}

export interface RepositoryLatestScores {
  architecture: number | null;

  engineeringQuality: number | null;

  productionReadiness: number | null;

  capability: number | null;

  maturity: number | null;

  confidence: number | null;

  risk: number | null;

  health: number | null;
}

export interface RepositoryHealthHistoryPoint {
  snapshotId: string;

  advisorSnapshotId: string | null;

  recordedAt: Date;

  architecture: number | null;

  engineeringQuality: number | null;

  productionReadiness: number | null;

  capability: number | null;

  maturity: number | null;

  confidence: number | null;

  risk: number | null;

  health: number | null;
}

export interface RepositoryHealthChange {
  recordedAt: Date;

  metric:
  | "ARCHITECTURE"
  | "ENGINEERING_QUALITY"
  | "PRODUCTION_READINESS"
  | "CAPABILITY"
  | "MATURITY"
  | "CONFIDENCE"
  | "RISK"
  | "HEALTH";

  previous: number;

  current: number;

  difference: number;

  direction: TrendDirection;

  summary: string;
}

export interface RepositoryHealthTrends {
  architecture: HealthMetricTrend;

  engineeringQuality: HealthMetricTrend;

  productionReadiness: HealthMetricTrend;

  capability: HealthMetricTrend;

  maturity: HealthMetricTrend;

  confidence: HealthMetricTrend;

  risk: HealthMetricTrend;

  health: HealthMetricTrend;
}

export interface RepositoryHealthResponse {
  repository: {
    id: string;

    name: string;

    fullName: string;
  };

  summary: RepositoryHealthSummary;

  latestScores: RepositoryLatestScores;

  trends: RepositoryHealthTrends;

  history: RepositoryHealthHistoryPoint[];

  changes: RepositoryHealthChange[];

  insights: string[];

  generatedAt: Date;
}