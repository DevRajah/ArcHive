/**
 * Human-readable summary stored inside every Executive Report.
 *
 * This first version is deterministic. It does not depend on an external
 * AI provider, so report generation remains reliable and inexpensive.
 */
export interface ExecutiveSummary {
  headline: string;
  overallHealth: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

/**
 * Organization Intelligence may evolve over time, so the summary builder
 * reads values defensively rather than assuming every field exists.
 */
type OrganizationDashboard = Record<string, any>;

const asNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : fallback;
};

const getTechnologyName = (
  technology: unknown,
): string | null => {
  if (typeof technology === "string") {
    return technology;
  }

  if (
    technology &&
    typeof technology === "object" &&
    "name" in technology &&
    typeof technology.name === "string"
  ) {
    return technology.name;
  }

  return null;
};

/**
 * Converts Organization Intelligence into a concise executive summary.
 */
export const buildExecutiveSummary = (
  dashboard: OrganizationDashboard,
): ExecutiveSummary => {
  const overview = dashboard.overview ?? {};

  const totalRepositories = asNumber(
    overview.totalRepositories ??
      overview.repositories ??
      dashboard.rankings?.length,
  );

  const averageArchitectureScore = asNumber(
    overview.averageArchitectureScore ??
      overview.architectureScore ??
      overview.averageHealthScore,
  );

  const highRiskRepositories = asNumber(
    overview.highRiskRepositories ??
      overview.repositoriesAtRisk ??
      dashboard.risks?.length,
  );

  const technologies =
    dashboard.technology?.topTechnologies ??
    dashboard.technology?.technologies ??
    [];

  const topTechnology = Array.isArray(technologies)
    ? getTechnologyName(technologies[0])
    : null;

  const strengths: string[] = [];
  const concerns: string[] = [];
  const recommendations: string[] = [];

  if (averageArchitectureScore >= 80) {
    strengths.push(
      "Architecture quality is strong across the analysed repository portfolio.",
    );
  } else if (averageArchitectureScore >= 60) {
    strengths.push(
      "The organisation maintains a generally healthy architecture baseline.",
    );
  } else if (totalRepositories > 0) {
    concerns.push(
      "The average architecture score indicates that several repositories may require improvement.",
    );
  }

  if (highRiskRepositories > 0) {
    concerns.push(
      `${highRiskRepositories} ${
        highRiskRepositories === 1
          ? "repository requires"
          : "repositories require"
      } engineering attention.`,
    );

    recommendations.push(
      "Prioritise the highest-risk repositories and address repeated architecture weaknesses before adding new complexity.",
    );
  }

  if (topTechnology) {
    strengths.push(
      `${topTechnology} is one of the most widely adopted technologies across the portfolio.`,
    );
  }

  if (
    Array.isArray(dashboard.recommendations) &&
    dashboard.recommendations.length > 0
  ) {
    recommendations.push(
      `${dashboard.recommendations.length} organisation-level engineering recommendations are currently available for review.`,
    );
  }

  if (strengths.length === 0) {
    strengths.push(
      "ArcHive has established portfolio-wide visibility across the analysed repositories.",
    );
  }

  if (concerns.length === 0) {
    concerns.push(
      "No major organisation-wide engineering concerns were identified in the current snapshot.",
    );
  }

  if (recommendations.length === 0) {
    recommendations.push(
      "Continue monitoring repository health trends and address emerging risks before they become systemic.",
    );
  }

  return {
    headline:
      totalRepositories > 0
        ? `${totalRepositories} ${
            totalRepositories === 1
              ? "repository was"
              : "repositories were"
          } analysed across the organisation.`
        : "ArcHive generated an organisation-wide engineering intelligence snapshot.",

    overallHealth:
      totalRepositories > 0
        ? `The current average architecture score is ${Math.round(
            averageArchitectureScore,
          )}%.`
        : "Architecture health data is not yet available for this report.",

    strengths,
    concerns,
    recommendations,
  };
};