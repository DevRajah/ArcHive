export type TrendDirection =
  | "IMPROVING"
  | "DECLINING"
  | "STABLE"
  | "UNKNOWN";

export interface TrendPoint {
  label: string;
  value: number;
}

export interface EngineeringTrendAnalysis {
  direction: TrendDirection;
  percentageChange: number | null;
  latestValue: number | null;
  previousValue: number | null;
  points: TrendPoint[];
}

type OrganizationDashboard = Record<string, any>;

const toSafeNumber = (
  value: unknown,
): number | null => {
  const parsedValue = Number(value);

  return Number.isFinite(parsedValue)
    ? parsedValue
    : null;
};

const extractTrendPoints = (
  value: unknown,
): TrendPoint[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) => {
      if (typeof item === "number") {
        return {
          label: String(index + 1),
          value: item,
        };
      }

      if (
        !item ||
        typeof item !== "object"
      ) {
        return null;
      }

      const record =
        item as Record<
          string,
          unknown
        >;

      const pointValue =
        toSafeNumber(
          record.value ??
            record.score ??
            record.count ??
            record.healthScore ??
            record.architectureScore,
        );

      if (pointValue === null) {
        return null;
      }

      const rawLabel =
        record.label ??
        record.period ??
        record.date ??
        record.month ??
        record.week;

      return {
        label:
          rawLabel === undefined ||
          rawLabel === null
            ? String(index + 1)
            : String(rawLabel),

        value: pointValue,
      };
    })
    .filter(
      (
        point,
      ): point is TrendPoint =>
        point !== null,
    );
};

/**
 * Determines whether the organisation's primary engineering metric is
 * improving, declining, or remaining stable.
 */
export const buildEngineeringTrendAnalysis = (
  dashboard: OrganizationDashboard,
): EngineeringTrendAnalysis => {
  const trendSource =
    dashboard.trends?.architecture ??
    dashboard.trends
      ?.architectureScore ??
    dashboard.trends?.health ??
    dashboard.trends
      ?.engineeringHealth ??
    dashboard.trends?.data ??
    dashboard.trends;

  const points =
    extractTrendPoints(
      trendSource,
    );

  if (points.length < 2) {
    return {
      direction: "UNKNOWN",
      percentageChange: null,
      latestValue:
        points[0]?.value ?? null,
      previousValue: null,
      points,
    };
  }

  const previousValue =
    points[
      points.length - 2
    ].value;

  const latestValue =
    points[
      points.length - 1
    ].value;

  const absoluteChange =
    latestValue - previousValue;

  const percentageChange =
    previousValue === 0
      ? null
      : Number(
          (
            (absoluteChange /
              previousValue) *
            100
          ).toFixed(2),
        );

  let direction:
    TrendDirection = "STABLE";

  if (absoluteChange > 1) {
    direction = "IMPROVING";
  } else if (
    absoluteChange < -1
  ) {
    direction = "DECLINING";
  }

  return {
    direction,
    percentageChange,
    latestValue,
    previousValue,
    points,
  };
};