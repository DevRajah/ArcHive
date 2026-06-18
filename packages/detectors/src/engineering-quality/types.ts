export type EngineeringQualityArea =
    | "ARCHITECTURE"
    | "SCALABILITY"
    | "SECURITY"
    | "TESTING"
    | "OBSERVABILITY"
    | "MAINTAINABILITY"
    | "DOCUMENTATION"
    | "DEVOPS";

export type QualityContribution = {
    area: EngineeringQualityArea;
    score: number;
    reason: string;
};

export type EngineeringQualityScore = {
    area: EngineeringQualityArea;
    score: number;
    grade: "A" | "B" | "C" | "D" | "E";
    level: "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "VERY_POOR";
    reasons: string[];
};

export type EngineeringQualityResult = {
    overallScore: number;
    overallGrade: "A" | "B" | "C" | "D" | "E";
    scores: EngineeringQualityScore[];
};