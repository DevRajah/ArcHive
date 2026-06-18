import { EngineeringQualityResult } from "../engineering-quality";
import { RepositoryMaturity } from "../maturity";
import { ProductionReadiness } from "../production-readiness";
import { TechnicalDebtReport } from "../technical-debt";
import { RepositoryWeakness, WeaknessReport } from "./types";

const getSeverity = (score: number): RepositoryWeakness["severity"] => {
  if (score < 40) return "HIGH";
  if (score < 65) return "MEDIUM";
  return "LOW";
};

export const buildWeaknessReport = ({
  engineeringQuality,
  repositoryMaturity,
  productionReadiness,
  technicalDebt,
}: {
  engineeringQuality: EngineeringQualityResult;
  repositoryMaturity: RepositoryMaturity;
  productionReadiness: ProductionReadiness;
  technicalDebt: TechnicalDebtReport;
}): WeaknessReport => {
  const weaknesses: RepositoryWeakness[] = [];

  for (const quality of engineeringQuality.scores) {
    if (quality.score < 65) {
      weaknesses.push({
        category: quality.area,
        title: `${quality.area} needs improvement`,
        description: `${quality.area} scored ${quality.score}, which indicates this area may need stronger engineering evidence.`,
        evidence: quality.reasons,
        severity: getSeverity(quality.score),
      });
    }
  }

  for (const blocker of productionReadiness.blockers) {
    if (blocker !== "No major engineering blockers detected.") {
      weaknesses.push({
        category: "PRODUCTION_READINESS",
        title: "Production readiness blocker",
        description: blocker,
        evidence: [blocker],
        severity: "HIGH",
      });
    }
  }

  for (const item of technicalDebt.items) {
    weaknesses.push({
      category: item.area,
      title: item.title,
      description: item.description,
      evidence: [item.recommendation],
      severity: item.severity,
    });
  }

  for (const weakness of repositoryMaturity.weaknesses) {
    weaknesses.push({
      category: "MATURITY",
      title: "Maturity weakness",
      description: weakness,
      evidence: [weakness],
      severity: "MEDIUM",
    });
  }

  const uniqueWeaknesses = Array.from(
    new Map(
      weaknesses.map((weakness) => [
        `${weakness.category}-${weakness.title}-${weakness.description}`,
        weakness,
      ])
    ).values()
  );

  return {
    weaknesses: uniqueWeaknesses,
  };
};