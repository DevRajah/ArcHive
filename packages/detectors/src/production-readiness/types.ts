export type ProductionReadinessLevel =
    | "NOT_READY"
    | "PARTIALLY_READY"
    | "PRODUCTION_READY"
    | "ENTERPRISE_READY";

export type ProductionReadiness = {
    score: number;

    level: ProductionReadinessLevel;

    summary: string;

    blockers: string[];

    strengths: string[];
};