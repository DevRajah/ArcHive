export interface TechnologyInsight {
  name: string;
  usageCount: number;
  category: string | null;
  percentage: number | null;
}

export interface TechnologyAnalysis {
  totalTechnologies: number;
  topTechnologies: TechnologyInsight[];
  dominantTechnology: string | null;
  categories: Record<string, number>;
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

const getTechnologyName = (
  technology: unknown,
): string | null => {
  if (typeof technology === "string") {
    return technology;
  }

  if (
    technology &&
    typeof technology === "object"
  ) {
    const record =
      technology as Record<
        string,
        unknown
      >;

    const name =
      record.name ??
      record.technology ??
      record.label;

    if (
      typeof name === "string" &&
      name.trim()
    ) {
      return name.trim();
    }
  }

  return null;
};

/**
 * Produces reusable technology intelligence for the report viewer and PDF.
 */
export const buildTechnologyAnalysis = (
  dashboard: OrganizationDashboard,
): TechnologyAnalysis => {
  const source =
    dashboard.technology?.topTechnologies ??
    dashboard.technology?.technologies ??
    dashboard.technology?.inventory ??
    [];

  const technologies =
    Array.isArray(source)
      ? source
      : [];

  const normalised =
    technologies
      .map((technology) => {
        const name =
          getTechnologyName(
            technology,
          );

        if (!name) {
          return null;
        }

        if (
          typeof technology === "string"
        ) {
          return {
            name,
            usageCount: 0,
            category: null,
            percentage: null,
          };
        }

        const record =
          technology as Record<
            string,
            unknown
          >;

        const rawPercentage =
          record.percentage ??
          record.share ??
          record.usagePercentage;

        const percentage =
          rawPercentage === undefined ||
          rawPercentage === null
            ? null
            : toSafeNumber(
                rawPercentage,
              );

        return {
          name,

          usageCount:
            toSafeNumber(
              record.count ??
                record.usageCount ??
                record.repositories ??
                record.repositoryCount,
            ),

          category:
            typeof record.category ===
            "string"
              ? record.category
              : typeof record.type ===
                  "string"
                ? record.type
                : null,

          percentage,
        };
      })
      .filter(
        (
          technology,
        ): technology is TechnologyInsight =>
          technology !== null,
      )
      .sort(
        (first, second) =>
          second.usageCount -
          first.usageCount,
      );

  const categories: Record<
    string,
    number
  > = {};

  for (const technology of normalised) {
    if (!technology.category) {
      continue;
    }

    categories[
      technology.category
    ] =
      (categories[
        technology.category
      ] ?? 0) + 1;
  }

  const topTechnologies =
    normalised.slice(0, 10);

  return {
    totalTechnologies:
      normalised.length,

    topTechnologies,

    dominantTechnology:
      topTechnologies[0]?.name ??
      null,

    categories,
  };
};