/**
 * Generates a human-readable Executive Summary from the
 * Organization Intelligence snapshot.
 *
 * This is intentionally deterministic rather than AI-generated.
 * The same input always produces the same summary.
 */

export interface ExecutiveSummary {
  headline: string;
  overallHealth: string;
  strengths: string[];
  concerns: string[];
  recommendations: string[];
}

export const buildExecutiveSummary = (
  dashboard: any,
): ExecutiveSummary => {
  const overview = dashboard.overview ?? {};

  const totalRepositories =
    overview.totalRepositories ?? 0;

  const averageArchitectureScore =
    overview.averageArchitectureScore ?? 0;

  const highRiskRepositories =
    overview.highRiskRepositories ?? 0;

  const technologies =
    dashboard.technology?.topTechnologies ?? [];

  const topTechnology =
    technologies.length > 0
      ? technologies[0].name
      : "N/A";

  const strengths: string[] = [];

  const concerns: string[] = [];

  const recommendations: string[] = [];

  if (averageArchitectureScore >= 80) {
    strengths.push(
      "Architecture quality remains consistently high across the organisation.",
    );
  }

  if (highRiskRepositories > 0) {
    concerns.push(
      `${highRiskRepositories} repositories require engineering attention.`,
    );

    recommendations.push(
      "Prioritise architectural improvements for high-risk repositories.",
    );
  }

  if (topTechnology !== "N/A") {
    strengths.push(
      `${topTechnology} remains a widely adopted technology across the portfolio.`,
    );
  }

  return {
    headline:
      `${totalRepositories} repositories analysed across the organisation.`,

    overallHealth:
      `Average architecture score: ${averageArchitectureScore}%`,

    strengths,

    concerns,

    recommendations,
  };
};