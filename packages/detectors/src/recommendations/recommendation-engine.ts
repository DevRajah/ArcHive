import { WeaknessReport } from "../weaknesses";
import { TechnicalDebtReport } from "../technical-debt";
import { ProductionReadiness } from "../production-readiness";
import {
  EngineeringRecommendation,
  RecommendationReport,
} from "./types";

const priorityFromSeverity = (
  severity: "LOW" | "MEDIUM" | "HIGH"
): EngineeringRecommendation["priority"] => {
  if (severity === "HIGH") return "HIGH";
  if (severity === "MEDIUM") return "MEDIUM";
  return "LOW";
};

export const buildRecommendationReport = ({
  weaknessReport,
  technicalDebt,
  productionReadiness,
}: {
  weaknessReport: WeaknessReport;
  technicalDebt: TechnicalDebtReport;
  productionReadiness: ProductionReadiness;
}): RecommendationReport => {
  const recommendations: EngineeringRecommendation[] = [];

  for (const weakness of weaknessReport.weaknesses) {
    recommendations.push({
      priority: priorityFromSeverity(weakness.severity),
      category: weakness.category,
      title: `Improve ${weakness.category.toLowerCase()} maturity`,
      reason: weakness.description,
      action:
        weakness.evidence[0] ||
        `Add stronger implementation evidence for ${weakness.category.toLowerCase()}.`,
    });
  }

  for (const debtItem of technicalDebt.items) {
    recommendations.push({
      priority: priorityFromSeverity(debtItem.severity),
      category: debtItem.area,
      title: debtItem.title,
      reason: debtItem.description,
      action: debtItem.recommendation,
    });
  }

  for (const blocker of productionReadiness.blockers) {
    if (blocker !== "No major engineering blockers detected.") {
      recommendations.push({
        priority: "HIGH",
        category: "PRODUCTION_READINESS",
        title: "Resolve production readiness blocker",
        reason: blocker,
        action: `Address this production concern before treating the repository as production-ready: ${blocker}`,
      });
    }
  }

  const uniqueRecommendations = Array.from(
    new Map(
      recommendations.map((recommendation) => [
        `${recommendation.category}-${recommendation.title}-${recommendation.action}`,
        recommendation,
      ])
    ).values()
  );

  return {
    recommendations: uniqueRecommendations.sort((a, b) => {
      const priorityOrder = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
  };
};