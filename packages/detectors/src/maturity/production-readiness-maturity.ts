import { MaturityInput } from "./maturity-types";
import { buildAssessment } from "./maturity-utils";

export const assessProductionReadinessMaturity = (input: MaturityInput) => {
  const productionReadiness = input.productionReadiness;

  if (!productionReadiness) {
    return buildAssessment({
      area: "PRODUCTION_READINESS",
      score: input.engineeringQuality.overallScore,
      strengths: ["Production readiness is inferred from engineering quality."],
      weaknesses: [],
      recommendations: ["Add explicit production readiness checks to improve assessment precision."],
    });
  }

  return buildAssessment({
    area: "PRODUCTION_READINESS",
    score: productionReadiness.score,
    strengths: productionReadiness.strengths,
    weaknesses: productionReadiness.blockers,
    recommendations:
      productionReadiness.blockers.length > 0
        ? productionReadiness.blockers.map((blocker) => `Resolve production blocker: ${blocker}`)
        : ["No major production readiness blockers detected."],
  });
};