export type AdvisorSeverity =
    | "CRITICAL"
    | "HIGH"
    | "MEDIUM"
    | "LOW"
    | "INFO";

/**
 * Canonical semantic meaning assigned by the Architecture Advisor backend.
 *
 * Future me:
 * Severity and kind answer different questions.
 *
 * `kind` tells us WHAT the finding means.
 * `severity` tells us HOW IMPORTANT that finding is within its kind.
 *
 * Never interpret a HIGH or CRITICAL finding as confirmed risk unless
 * kind === "CONFIRMED_RISK".
 */
export type ArchitectureAdvisorFindingKind =
    | "STRENGTH"
    | "CONFIRMED_RISK"
    | "IMPROVEMENT"
    | "UNVERIFIED";

export interface AdvisorFinding {
    key?: string;

    kind: ArchitectureAdvisorFindingKind;

    severity: AdvisorSeverity;
    category: string;
    title: string;
    description: string;
    evidence: string[] | string;

    /*
     * The backend may legitimately return null for findings that do not
     * require a recommendation, including strengths.
     */
    recommendation: string | null;
}

export interface AdvisorStrength {
    key?: string;

    /*
     * Strengths are still returned in their own backend collection, but
     * the backend now also explicitly identifies their semantic kind.
     */
    kind: "STRENGTH";

    severity: AdvisorSeverity;
    category: string;
    title: string;
    description: string;
    evidence: string[] | string;
    recommendation: string | null;
}

export interface AdvisorPriorityAction {
    key?: string;
    priority: number;
    severity: AdvisorSeverity;
    category: string;
    title: string;
    description: string;
    rationale: string;
}

export interface AdvisorRecommendedStep {
    key?: string;
    priority?: number;
    severity?: AdvisorSeverity;
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
     * These optional aliases keep the frontend tolerant of the score names
     * currently returned by the backend without changing their semantics.
     */
    confidenceScore?: number | null;
    maturityScore?: number | null;
    engineeringQualityScore?: number | null;
    productionReadinessScore?: number | null;
}

export interface AdvisorEvidenceSummary {
    /**
     * Canonical backend signal for whether there is enough repository
     * intelligence to present an Architecture Advisor assessment.
     *
     * false does not mean healthy or unhealthy.
     * It means ArcHive does not yet have enough evidence to assess.
     */
    evidenceSufficient: boolean;

    intelligenceSnapshotAvailable: boolean;

    /*
     * The backend currently returns the *Count names below.
     */
    architectureChangeCount?: number;
    activeRecommendationCount?: number;
    repositoryTypeCount?: number;
    architectureDomainCount?: number;

    technologyCount: number;
    capabilityCount: number;

    intelligenceSnapshotCreatedAt?: string | null;

    /*
     * Older frontend/backend payload compatibility.
     */
    architectureChanges?: number;
    recommendations?: number;
    repositoryTypes?: number;
    architectureDomains?: number;
}

export interface ArchitectureAdvisorAssessment {
    repositoryId: string;
    repositoryName?: string;

    overallAssessment: string;
    maturityLabel: string;

    /**
     * Backend-owned confirmed-risk score.
     *
     * Important:
     * This is NOT a probability and must not be rendered as "% risk".
     *
     * At present only CONFIRMED_RISK findings contribute to this value.
     */
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

    sourceIntelligenceSnapshotId?: string | null;

    generatedAt: string;
}

/**
 * Historical Advisor contract.
 *
 * Do not infer modern finding semantics from this shape because historical
 * items do not currently expose finding.kind.
 */
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