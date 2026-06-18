import { ArchitectureDriftReport } from "../architecture-drift";
import { EngineeringQualityResult } from "../engineering-quality";
import { EvolutionInsightsReport } from "../repository-evolution";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryHealth } from "../repository-health";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtReport } from "../technical-debt";
import { WeaknessReport } from "../weaknesses";
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

const addUniqueRecommendation = (
  recommendations: EngineeringRecommendation[],
  recommendation: EngineeringRecommendation
) => {
  const key = `${recommendation.priority}-${recommendation.category}-${recommendation.title}-${recommendation.action}`;

  const exists = recommendations.some(
    (item) =>
      `${item.priority}-${item.category}-${item.title}-${item.action}` === key
  );

  if (!exists) {
    recommendations.push(recommendation);
  }
};

export const buildRecommendationReport = ({
  weaknessReport,
  technicalDebt,
  productionReadiness,
  engineeringQuality,
  repositoryMaturity,
  repositoryHealth,
  architectureDrift,
  evolutionInsights,
}: {
  weaknessReport: WeaknessReport;
  technicalDebt: TechnicalDebtReport;
  productionReadiness: ProductionReadiness;
  engineeringQuality: EngineeringQualityResult;
  repositoryMaturity: RepositoryMaturity;
  repositoryHealth: RepositoryHealth;
  architectureDrift: ArchitectureDriftReport;
  evolutionInsights: EvolutionInsightsReport;
}): RecommendationReport => {
  const recommendations: EngineeringRecommendation[] = [];

  for (const weakness of weaknessReport.weaknesses) {
    addUniqueRecommendation(recommendations, {
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
    addUniqueRecommendation(recommendations, {
      priority: priorityFromSeverity(debtItem.severity),
      category: debtItem.area,
      title: debtItem.title,
      reason: debtItem.description,
      action: debtItem.recommendation,
    });
  }

  for (const quality of engineeringQuality.scores) {
    if (quality.score < 50) {
      addUniqueRecommendation(recommendations, {
        priority: "HIGH",
        category: quality.area,
        title: `Prioritise ${quality.area.toLowerCase()} improvement`,
        reason: `${quality.area} quality is low with a score of ${quality.score}.`,
        action:
          quality.reasons[0] ||
          `Strengthen ${quality.area.toLowerCase()} implementation before scaling this repository further.`,
      });
    }
  }

  if (productionReadiness.level === "NOT_READY") {
    addUniqueRecommendation(recommendations, {
      priority: "HIGH",
      category: "PRODUCTION_READINESS",
      title: "Improve production readiness before deployment",
      reason: productionReadiness.summary,
      action:
        productionReadiness.blockers[0] ||
        "Resolve critical production-readiness gaps before treating this repository as deployable.",
    });
  }

  if (
    repositoryMaturity.level === "PROTOTYPE" ||
    repositoryMaturity.level === "GROWING"
  ) {
    addUniqueRecommendation(recommendations, {
      priority: "MEDIUM",
      category: "MATURITY",
      title: "Increase repository maturity",
      reason: repositoryMaturity.summary,
      action:
        repositoryMaturity.recommendations[0] ||
        "Improve weak maturity areas such as testing, documentation, DevOps, observability, or security.",
    });
  }

  if (
    repositoryHealth.status === "AT_RISK" ||
    repositoryHealth.status === "CRITICAL"
  ) {
    addUniqueRecommendation(recommendations, {
      priority: repositoryHealth.status === "CRITICAL" ? "HIGH" : "MEDIUM",
      category: "REPOSITORY_HEALTH",
      title: "Address repository health risks",
      reason: repositoryHealth.summary,
      action:
        repositoryHealth.concerns[0] ||
        "Review repository health concerns and improve the weakest engineering areas.",
    });
  }

  if (architectureDrift.severity === "HIGH") {
    addUniqueRecommendation(recommendations, {
      priority: "HIGH",
      category: "ARCHITECTURE_DRIFT",
      title: "Review architecture drift",
      reason: architectureDrift.summary,
      action:
        architectureDrift.items[0]?.description ||
        "Review whether the repository has accumulated too many responsibilities and consider separating concerns.",
    });
  }

  if (evolutionInsights.direction === "BECOMING_MORE_COMPLEX") {
    addUniqueRecommendation(recommendations, {
      priority: "MEDIUM",
      category: "EVOLUTION",
      title: "Control repository complexity growth",
      reason: evolutionInsights.summary,
      action:
        evolutionInsights.insights[0]?.description ||
        "Review repository boundaries and document the intended architecture direction.",
    });
  }

  return {
    recommendations: recommendations.sort((a, b) => {
      const priorityOrder = {
        HIGH: 3,
        MEDIUM: 2,
        LOW: 1,
      };

      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }),
  };
};