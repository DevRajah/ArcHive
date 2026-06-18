import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtItem, TechnicalDebtReport } from "./types";

const getSeverity = (score: number): TechnicalDebtReport["severity"] => {
  if (score >= 70) return "HIGH";
  if (score >= 40) return "MEDIUM";
  return "LOW";
};

const getSummary = (severity: TechnicalDebtReport["severity"]) => {
  switch (severity) {
    case "HIGH":
      return "Repository shows several technical debt signals that may affect production readiness or long-term maintainability.";
    case "MEDIUM":
      return "Repository has some technical debt, but the issues appear manageable.";
    case "LOW":
      return "Repository shows limited technical debt based on detected engineering evidence.";
  }
};

export const buildTechnicalDebtReport = ({
  engineeringQuality,
  productionReadiness,
  repositoryMaturity,
}: {
  engineeringQuality: EngineeringQualityResult;
  productionReadiness: ProductionReadiness;
  repositoryMaturity: RepositoryMaturity;
}): TechnicalDebtReport => {
  const items: TechnicalDebtItem[] = [];

  for (const quality of engineeringQuality.scores) {
    if (quality.score < 45) {
      items.push({
        severity: "HIGH",
        area: quality.area,
        title: `${quality.area} maturity is weak`,
        description: `${quality.area} scored ${quality.score}, which indicates an important engineering gap.`,
        recommendation:
          quality.reasons[0] ||
          `Improve ${quality.area.toLowerCase()} practices with clearer implementation evidence.`,
      });
    } else if (quality.score < 65) {
      items.push({
        severity: "MEDIUM",
        area: quality.area,
        title: `${quality.area} needs improvement`,
        description: `${quality.area} scored ${quality.score}, which suggests room for improvement.`,
        recommendation:
          quality.reasons[0] ||
          `Strengthen ${quality.area.toLowerCase()} practices to improve repository quality.`,
      });
    }
  }

  for (const blocker of productionReadiness.blockers) {
    if (blocker !== "No major engineering blockers detected.") {
      items.push({
        severity: "HIGH",
        area: "PRODUCTION_READINESS",
        title: "Production readiness blocker detected",
        description: blocker,
        recommendation: `Resolve production readiness concern: ${blocker}`,
      });
    }
  }

  for (const weakness of repositoryMaturity.weaknesses) {
    items.push({
      severity: "MEDIUM",
      area: "MATURITY",
      title: "Repository maturity weakness detected",
      description: weakness,
      recommendation: `Address maturity weakness: ${weakness}`,
    });
  }

  const highCount = items.filter((item) => item.severity === "HIGH").length;
  const mediumCount = items.filter((item) => item.severity === "MEDIUM").length;

  const debtScore = Math.min(100, highCount * 25 + mediumCount * 10);
  const severity = getSeverity(debtScore);

  return {
    debtScore,
    severity,
    summary: getSummary(severity),
    items,
  };
};