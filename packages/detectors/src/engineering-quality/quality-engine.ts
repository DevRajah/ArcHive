import {
    EngineeringQualityArea,
    EngineeringQualityResult,
    EngineeringQualityScore,
} from "./types";

import { EngineeringQualityContext } from "./quality-context";

const gradeFromScore = (
    score: number
): EngineeringQualityScore["grade"] => {

    if (score >= 90) return "A";

    if (score >= 75) return "B";

    if (score >= 60) return "C";

    if (score >= 40) return "D";

    return "E";

};

const levelFromGrade = (
    grade: EngineeringQualityScore["grade"]
): EngineeringQualityScore["level"] => {

    switch (grade) {

        case "A":
            return "EXCELLENT";

        case "B":
            return "GOOD";

        case "C":
            return "FAIR";

        case "D":
            return "POOR";

        default:
            return "VERY_POOR";

    }

};

export const buildEngineeringQuality = (
    context: EngineeringQualityContext
): EngineeringQualityResult => {

    const grouped = new Map<
        EngineeringQualityArea,
        {
            score: number;
            reasons: string[];
        }
    >();

    for (const contribution of context.contributions) {

        const current = grouped.get(contribution.area) ?? {
            score: 0,
            reasons: [],
        };

        current.score += contribution.score;

        current.reasons.push(contribution.reason);

        grouped.set(contribution.area, current);

    }

    const scores: EngineeringQualityScore[] =
        Array.from(grouped.entries()).map(([area, value]) => {

            const score = Math.min(100, value.score);

            const grade = gradeFromScore(score);

            return {
                area,
                score,
                grade,
                level: levelFromGrade(grade),
                reasons: value.reasons,
            };

        });

    const overallScore =
        scores.length === 0
            ? 0
            : Math.round(
                  scores.reduce(
                      (sum, score) => sum + score.score,
                      0
                  ) / scores.length
              );

    return {
        overallScore,
        overallGrade: gradeFromScore(overallScore),
        scores,
    };

};