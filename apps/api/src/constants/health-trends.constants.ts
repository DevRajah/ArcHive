/*
|--------------------------------------------------------------------------
| Repository Health Trend Constants
|--------------------------------------------------------------------------
|
| Every repository health score is derived from immutable repository
| intelligence snapshots and architecture advisor snapshots.
|
| These constants intentionally live in one place so future tuning of the
| health engine does not require changing the trend calculation logic.
|--------------------------------------------------------------------------
*/

import type { RiskLevel } from "../types/health-trends.types";

/*
|--------------------------------------------------------------------------
| Composite Health Score Weights
|--------------------------------------------------------------------------
|
| Total = 100%
|
| Risk is inverted because a lower risk increases overall repository health.
|--------------------------------------------------------------------------
*/

export const HEALTH_SCORE_WEIGHTS = {
  architecture: 0.25,

  engineeringQuality: 0.20,

  productionReadiness: 0.20,

  capability: 0.10,

  maturity: 0.10,

  confidence: 0.10,

  risk: 0.05,
} as const;

/*
|--------------------------------------------------------------------------
| Trend Detection Thresholds
|--------------------------------------------------------------------------
*/

export const TREND_THRESHOLDS = {
  improvement: 5,

  regression: -5,

  majorImprovement: 15,

  majorRegression: -15,

  stableTolerance: 2,
} as const;

/*
|--------------------------------------------------------------------------
| Repository Direction Thresholds
|--------------------------------------------------------------------------
*/

export const REPOSITORY_DIRECTION = {
  IMPROVING: 8,

  DECLINING: -8,

  STABLE: 3,
} as const;

/*
|--------------------------------------------------------------------------
| Risk Classification
|--------------------------------------------------------------------------
*/

export const RISK_LEVELS: Array<{
  minimum: number;
  level: RiskLevel;
}> = [
  {
    minimum: 75,
    level: "CRITICAL",
  },

  {
    minimum: 50,
    level: "HIGH",
  },

  {
    minimum: 25,
    level: "MODERATE",
  },

  {
    minimum: 0,
    level: "LOW",
  },
];

/*
|--------------------------------------------------------------------------
| Turning Point Detection
|--------------------------------------------------------------------------
*/

export const TURNING_POINT = {
  minimumSnapshots: 4,

  consecutiveImprovement: 3,

  consecutiveRegression: 3,
} as const;

/*
|--------------------------------------------------------------------------
| Advisor History Limits
|--------------------------------------------------------------------------
*/

export const HISTORY = {
  maximumSnapshots: 100,
} as const;