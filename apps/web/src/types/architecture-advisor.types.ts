export type AdvisorSeverity =
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "INFO";

export interface AdvisorFinding {
    severity: AdvisorSeverity;
    category: string;
    title: string;
    description: string;
    evidence: string[] | string;
    recommendation: string;
}

export interface AdvisorStrength {
    title: string;
    description: string;
    evidence: string[] | string;
}

export interface AdvisorPriorityAction {
    priority: number;
    severity: AdvisorSeverity;
    category: string;
    title: string;
    description: string;
    rationale: string;
}

export interface AdvisorRecommendedStep {
    title: string;
    description?: string;
    rationale?: string;
    category?: string;
}

export interface AdvisorScores {
    architectureScore: number;
    engineeringQuality: number;
    capabilityScore: number;
    productionReadiness: number;

    /*
     * These optional aliases make the frontend tolerant of slightly
     * different score naming without changing the backend contract.
     */
    engineeringQualityScore?: number;
    productionReadinessScore?: number;
}

export interface AdvisorEvidenceSummary {
    /*
     * This is the canonical backend signal that tells the frontend
     * whether ArcHive has enough repository intelligence to produce
     * a meaningful Architecture Advisor assessment.
     *
     * Important:
     * evidenceSufficient === false does NOT mean the repository is
     * healthy or unhealthy. It means maturity, risk, and other
     * assessment conclusions are not yet reliable enough to present
     * as measured repository health.
     */
    evidenceSufficient: boolean;

    intelligenceSnapshotAvailable: boolean;
    architectureChanges: number;
    recommendations: number;
    technologyCount: number;
    capabilityCount: number;
    repositoryTypes: number;
    architectureDomains: number;
}

export interface ArchitectureAdvisorAssessment {
    repositoryId: string;
    repositoryName?: string;

    overallAssessment: string;
    maturityLabel: string;
    overallRiskScore: number;
    confidenceScore: number;

    scores: AdvisorScores;

    technologies: string[];
    architectureDomains: string[];
    repositoryTypes: string[];
    capabilities: string[];

    strengths: AdvisorStrength[];

    architectureConcerns: AdvisorFinding[];
    productionRisks: AdvisorFinding[];
    securityObservations: AdvisorFinding[];
    scalabilityConcerns: AdvisorFinding[];
    reliabilityConcerns: AdvisorFinding[];
    maintainabilityConcerns: AdvisorFinding[];
    observabilityConcerns: AdvisorFinding[];
    dataConcerns: AdvisorFinding[];
    deliveryConcerns: AdvisorFinding[];

    priorityActions: AdvisorPriorityAction[];

    recommendedNextSteps: Array<
        string | AdvisorRecommendedStep
    >;

    evidenceSummary: AdvisorEvidenceSummary;

    generatedAt: string;
}

export interface AdvisorHistoryItem {
    id?: string;
    generatedAt: string;
    overallRiskScore: number;
    confidenceScore: number;
    maturityLabel: string;
    overallAssessment?: string;
}

export interface ArchitectureAdvisorHistory {
    repositoryId?: string;
    repositoryName?: string;
    history: AdvisorHistoryItem[];
}