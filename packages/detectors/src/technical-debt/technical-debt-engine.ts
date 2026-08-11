import { EngineeringQualityResult } from "../engineering-quality";
import {
  TechnicalDebtItem,
  TechnicalDebtReport,
} from "./types";

const getSeverity = (
  score: number
): TechnicalDebtReport["severity"] => {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";

  return "LOW";
};

const getSummary = (
  severity: TechnicalDebtReport["severity"]
) => {
  switch (severity) {
    case "HIGH":
      return "Repository shows several technical debt signals that may affect maintainability or long-term engineering sustainability.";

    case "MEDIUM":
      return "Repository has some technical debt, but the identified engineering gaps appear manageable.";

    case "LOW":
      return "Repository shows limited technical debt based on detected engineering-quality evidence.";
  }
};

export const buildTechnicalDebtReport = ({
  engineeringQuality,
}: {
  engineeringQuality: EngineeringQualityResult;
}): TechnicalDebtReport => {
  const items: TechnicalDebtItem[] = [];

  /**
   * Future me:
   * Technical debt should not be a second copy of Production Readiness or
   * Repository Maturity.
   *
   * Those metrics already have their own meaning elsewhere in ArcHive.
   * Technical debt here is intentionally derived from concrete weaknesses
   * in engineering-quality areas.
   */
  for (const quality of engineeringQuality.scores) {
    if (quality.score < 45) {
      items.push({
        severity: "HIGH",
        area: quality.area,
        title: `${quality.area} engineering debt is significant`,
        description:
          `${quality.area} scored ${quality.score}, which indicates a substantial engineering-practice gap.`,
        recommendation:
          quality.reasons[0] ||
          `Improve ${quality.area.toLowerCase()} practices with clearer implementation evidence.`,
      });

      continue;
    }

    if (quality.score < 65) {
      items.push({
        severity: "MEDIUM",
        area: quality.area,
        title: `${quality.area} engineering debt needs attention`,
        description:
          `${quality.area} scored ${quality.score}, which suggests room for engineering improvement.`,
        recommendation:
          quality.reasons[0] ||
          `Strengthen ${quality.area.toLowerCase()} practices to improve repository quality.`,
      });
    }
  }

  const highCount = items.filter(
    (item) => item.severity === "HIGH"
  ).length;

  const mediumCount = items.filter(
    (item) => item.severity === "MEDIUM"
  ).length;

  /**
   * Keep the existing severity weighting for now.
   *
   * We are fixing semantic duplication first, rather than changing several
   * scoring rules at once. We can calibrate these weights later using more
   * repositories if the distribution still proves too aggressive.
   */
  const debtScore = Math.min(
    100,
    highCount * 25 + mediumCount * 10
  );

  const severity = getSeverity(debtScore);

  return {
    debtScore,
    severity,
    summary: getSummary(severity),
    items,
  };
};