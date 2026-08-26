import type {
  ExecutiveKpis,
} from "@archive/types";

export type {
  ExecutiveKpis,
} from "@archive/types";

/**
 * Compact metrics displayed prominently in an Executive Report.
 *
 * These values are calculated once by the worker. The frontend and PDF
 * generator can then display them without repeating business logic.
 */

type ReportDashboard =
  Record<string, any>;

const toSafeNumber = (
  value: unknown,
  fallback = 0,
): number => {
  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue,
  )
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
 *
 * Important:
 * Risk classification is backend-owned.
 *
 * `highRiskRepositories` therefore comes only from an explicit
 * backend risk classification count. It must never fall back to the
 * total number of risk records.
 */
export const buildExecutiveKpis = (
  dashboard: ReportDashboard,
): ExecutiveKpis => {
  const overview =
    dashboard.overview ?? {};

  const risks =
    dashboard.risks ?? {};

  const technologies =
    dashboard.technology
      ?.topTechnologies ??
    dashboard.technology
      ?.technologies ??
    dashboard.technology
      ?.inventory ??
    [];

  return {
    repositories:
      toSafeNumber(
        overview.totalRepositories ??
          dashboard.repositories
            ?.total ??
          overview.repositories ??
          dashboard.rankings
            ?.length,
      ),

    averageArchitectureScore:
      Math.round(
        toSafeNumber(
          overview
            .averageArchitectureScore ??
            overview
              .architectureScore ??
            overview
              .averageHealthScore,
        ),
      ),

    /*
     * Only explicit HIGH classification counts belong here.
     *
     * CRITICAL remains a separate severity and is not silently folded
     * into HIGH unless the backend later defines the KPI that way.
     */
    highRiskRepositories:
      toSafeNumber(
        risks.highRiskRepositories ??
          overview
            .highRiskRepositories,
      ),

    recommendations:
      getArrayLength(
        dashboard.recommendations,
      ),

    technologies:
      getArrayLength(
        technologies,
      ),

    /*
     * Organization dashboard activity may be:
     * { items: [...] }
     *
     * Older dashboard shapes may expose the array directly.
     */
    engineeringEvents:
      getArrayLength(
        dashboard.activity?.items ??
          dashboard.activity,
      ),
  };
};