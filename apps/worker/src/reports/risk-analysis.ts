export interface RiskBreakdown {
  critical: number;
  high: number;
  medium: number;
  low: number;
  unknown: number;
  total: number;
  highestSeverity: string | null;
}

type OrganizationDashboard = Record<string, any>;

const normaliseSeverity = (
  value: unknown,
): string => {
  return String(value ?? "")
    .trim()
    .toUpperCase();
};

/**
 * Converts the organisation risk list into a simple severity breakdown.
 */
export const buildRiskBreakdown = (
  dashboard: OrganizationDashboard,
): RiskBreakdown => {
  const risks = Array.isArray(
    dashboard.risks,
  )
    ? dashboard.risks
    : [];

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
    const severity = normaliseSeverity(
      risk?.severity ??
        risk?.level ??
        risk?.riskLevel,
    );

    switch (severity) {
      case "CRITICAL":
        result.critical += 1;
        break;

      case "HIGH":
        result.high += 1;
        break;

      case "MEDIUM":
      case "MODERATE":
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