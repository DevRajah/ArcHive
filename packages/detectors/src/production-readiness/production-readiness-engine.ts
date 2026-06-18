import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "./types";

const determineLevel = (
    score: number
): ProductionReadiness["level"] => {

    if (score >= 90) return "ENTERPRISE_READY";

    if (score >= 75) return "PRODUCTION_READY";

    if (score >= 50) return "PARTIALLY_READY";

    return "NOT_READY";

};

const determineSummary = (
    level: ProductionReadiness["level"]
) => {

    switch (level) {

        case "ENTERPRISE_READY":
            return "Repository demonstrates excellent engineering practices for enterprise production environments.";

        case "PRODUCTION_READY":
            return "Repository appears suitable for production deployment with only minor improvements recommended.";

        case "PARTIALLY_READY":
            return "Repository contains a solid engineering foundation but several production concerns remain.";

        default:
            return "Repository is not yet ready for production deployment.";

    }

};

export const buildProductionReadiness = ({
    engineeringQuality,
}: {
    engineeringQuality: EngineeringQualityResult;

}): ProductionReadiness => {

    let score = engineeringQuality.overallScore;


    score = Math.min(100, Math.round(score));

    const blockers: string[] = [];

    const strengths: string[] = [];

    engineeringQuality.scores.forEach((quality) => {

        if (quality.score >= 75) {

            strengths.push(
                `${quality.area} engineering quality is strong.`
            );

        }

        if (quality.score < 40) {

            blockers.push(
                `${quality.area} engineering quality needs significant improvement.`
            );

        }

    });

    if (strengths.length === 0) {

        strengths.push(
            "No engineering area currently exceeds the production-readiness threshold."
        );

    }

    if (blockers.length === 0) {

        blockers.push(
            "No major engineering blockers detected."
        );

    }

    return {

        score,

        level: determineLevel(score),

        summary: determineSummary(
            determineLevel(score)
        ),

        blockers,

        strengths,

    };

};