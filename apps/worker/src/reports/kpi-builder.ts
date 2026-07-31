/**
 * Compact metrics displayed prominently in an Executive Report.
 *
 * These values are calculated once by the worker. The frontend and PDF
 * generator can then display them without repeating business logic.
 */
export interface ExecutiveKpis {
  repositories: number;
  averageArchitectureScore: number;
  highRiskRepositories: number;
  recommendations: number;
  technologies: number;
  engineeringEvents: number;
}

type OrganizationDashboard = Record<string, any>;

const toSafeNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : fallback;
};

const getArrayLength = (
  value: unknown,
): number => {
  return Array.isArray(value)
    ? value.length
    : 0;
};

/**
 * Builds the headline KPIs used throughout the generated report.
 */
export const buildExecutiveKpis = (
  dashboard: OrganizationDashboard,
): ExecutiveKpis => {
  const overview =
    dashboard.overview ?? {};

  const technologies =
    dashboard.technology?.topTechnologies ??
    dashboard.technology?.technologies ??
    dashboard.technology?.inventory ??
    [];

  return {
    repositories: toSafeNumber(
      overview.totalRepositories ??
        overview.repositories ??
        dashboard.rankings?.length,
    ),

    averageArchitectureScore:
      Math.round(
        toSafeNumber(
          overview.averageArchitectureScore ??
            overview.architectureScore ??
            overview.averageHealthScore,
        ),
      ),

    highRiskRepositories:
      toSafeNumber(
        overview.highRiskRepositories ??
          overview.repositoriesAtRisk ??
          dashboard.risks?.length,
      ),

    recommendations:
      getArrayLength(
        dashboard.recommendations,
      ),

    technologies:
      getArrayLength(technologies),

    engineeringEvents:
      getArrayLength(
        dashboard.activity,
      ),
  };
};