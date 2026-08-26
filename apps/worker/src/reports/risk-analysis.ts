import type {
  RiskAssessmentContext,
  RiskBreakdown,
  ReportRiskSeverity,
} from "@archive/types";

export type {
  RiskBreakdown,
} from "@archive/types";

type ReportDashboard = Record<string, any>;

const normaliseSeverity = (
  value: unknown,
): ReportRiskSeverity | null => {
  const severity = String(
    value ?? "",
  )
    .trim()
    .toUpperCase();

  switch (severity) {
    case "CRITICAL":
      return "CRITICAL";

    case "HIGH":
      return "HIGH";

    case "MEDIUM":
    case "MODERATE":
      return "MEDIUM";

    case "LOW":
      return "LOW";

    default:
      return null;
  }
};

/**
 * Return only the backend-owned canonical repository risk records.
 *
 * Current Organization and Team dashboards expose risk information as
 * a summary object containing `repositories`.
 *
 * The array fallback is retained only for compatibility with older
 * dashboard/report shapes.
 *
 * Important:
 * This function does NOT inspect Advisor snapshots and does NOT decide
 * whether a repository is assessable. That decision belongs to the API.
 */
const getCanonicalRiskRepositories = (
  dashboard: ReportDashboard,
): unknown[] => {
  if (
    Array.isArray(
      dashboard.risks?.repositories,
    )
  ) {
    return dashboard.risks.repositories;
  }

  if (Array.isArray(dashboard.risks)) {
    return dashboard.risks;
  }

  return [];
};

/**
 * Converts the backend-owned canonical risk collection into a severity
 * distribution for the persisted Executive Report.
 *
 * Only repositories already admitted to the canonical backend risk
 * population are counted here.
 */
export const buildRiskBreakdown = (
  dashboard: ReportDashboard,
): RiskBreakdown => {
  const risks =
    getCanonicalRiskRepositories(
      dashboard,
    );

  const result: RiskBreakdown = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    unknown: 0,
    total: risks.length,
    highestSeverity: null,
  };

  for (const risk of risks) {
    const severity =
      normaliseSeverity(
        (risk as any)?.severity ??
        (risk as any)?.level ??
        (risk as any)?.riskLevel,
      );

    switch (severity) {
      case "CRITICAL":
        result.critical += 1;
        break;

      case "HIGH":
        result.high += 1;
        break;

      case "MEDIUM":
        result.medium += 1;
        break;

      case "LOW":
        result.low += 1;
        break;

      default:
        result.unknown += 1;
        break;
    }
  }

  if (result.critical > 0) {
    result.highestSeverity =
      "CRITICAL";
  } else if (result.high > 0) {
    result.highestSeverity =
      "HIGH";
  } else if (result.medium > 0) {
    result.highestSeverity =
      "MEDIUM";
  } else if (result.low > 0) {
    result.highestSeverity =
      "LOW";
  }

  return result;
};

/**
 * Builds Schema V4's explicit risk-assessment context.
 *
 * Backend semantics remain authoritative:
 *
 * - canonical risk records determine the assessed population;
 * - Organization Overview may explicitly expose unassessed count and
 *   risk-assessment coverage;
 * - averageRiskScore and overallRiskLevel are consumed only when an
 *   assessed population actually exists.
 *
 * Zero is preserved as a legitimate assessed risk score.
 * Missing/unavailable aggregate risk remains null.
 */
export const buildRiskAssessmentContext = (
  dashboard: ReportDashboard,
): RiskAssessmentContext => {
  const overview =
    dashboard.overview ?? {};

  const risks =
    dashboard.risks ?? {};

  const canonicalRepositories =
    getCanonicalRiskRepositories(
      dashboard,
    );

  /*
   * Prefer the canonical backend risk-summary count.
   * Fall back to the actual canonical repository array.
   */
  const assessedRepositories =
    typeof risks.totalRepositories ===
      "number" &&
      Number.isFinite(
        risks.totalRepositories,
      )
      ? risks.totalRepositories
      : canonicalRepositories.length;

  /*
   * Total portfolio/workspace repositories.
   *
   * USER Organization Dashboard:
   * overview.totalRepositories
   *
   * TEAM Dashboard:
   * repositories.total
   */
  const rawTotalRepositories =
    overview.totalRepositories ??
    dashboard.repositories?.total ??
    dashboard.repositories
      ?.totalRepositories;

  const totalRepositories =
    typeof rawTotalRepositories ===
      "number" &&
      Number.isFinite(
        rawTotalRepositories,
      )
      ? rawTotalRepositories
      : assessedRepositories;

  /*
   * Organization Overview now exposes this explicitly.
   *
   * Some Team dashboard versions may not expose the field yet.
   * In that case, deriving the count from:
   *
   * total repositories - canonical assessed repositories
   *
   * is coverage arithmetic only. It does NOT classify any repository
   * or reconstruct Advisor intelligence.
   */
  const explicitUnassessed =
    overview.unassessedRiskRepositories ??
    dashboard.riskAssessment
      ?.unassessedRiskRepositories;

  const unassessedRepositories =
    typeof explicitUnassessed ===
      "number" &&
      Number.isFinite(
        explicitUnassessed,
      )
      ? explicitUnassessed
      : Math.max(
        totalRepositories -
        assessedRepositories,
        0,
      );

  const explicitCoverage =
    overview
      .riskAssessmentCoveragePercentage ??
    dashboard.riskAssessment
      ?.coveragePercentage;

  const assessmentCoveragePercentage =
    typeof explicitCoverage ===
      "number" &&
      Number.isFinite(
        explicitCoverage,
      )
      ? explicitCoverage
      : totalRepositories > 0
        ? Number(
          (
            (assessedRepositories /
              totalRepositories) *
            100
          ).toFixed(1),
        )
        : 0;

  /*
   * Only an assessed population can have aggregate risk semantics.
   *
   * Do NOT use `?? 0`.
   */
  const rawAverageRiskScore =
    overview.averageRiskScore ??
    risks.averageRiskScore;

  const averageRiskScore =
    assessedRepositories > 0 &&
      typeof rawAverageRiskScore ===
      "number" &&
      Number.isFinite(
        rawAverageRiskScore,
      )
      ? rawAverageRiskScore
      : null;

  const rawOverallRiskLevel =
    overview.overallRiskLevel ??
    risks.overallRiskLevel;

  const overallRiskLevel =
    assessedRepositories > 0
      ? normaliseSeverity(
        rawOverallRiskLevel,
      )
      : null;

  return {
    totalRepositories,
    assessedRepositories,
    unassessedRepositories,
    assessmentCoveragePercentage,
    averageRiskScore,
    overallRiskLevel,
  };
};