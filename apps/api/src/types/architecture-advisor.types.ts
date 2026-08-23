export type ArchitectureAdvisorSeverity =
  | "INFO"
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type ArchitectureAdvisorCategory =
  | "ARCHITECTURE"
  | "PRODUCTION_READINESS"
  | "SECURITY"
  | "SCALABILITY"
  | "RELIABILITY"
  | "MAINTAINABILITY"
  | "OBSERVABILITY"
  | "DATA"
  | "DELIVERY"
  | "ENGINEERING_QUALITY";

export type ArchitectureAdvisorFindingKind =
  | "STRENGTH"
  | "CONFIRMED_RISK"
  | "IMPROVEMENT"
  | "UNVERIFIED";
  ;

export type ArchitectureAdvisorFinding = {
  key: string;
  category: ArchitectureAdvisorCategory;
  /**
  * Describes what this finding actually means.
  *
  * CONFIRMED_RISK
  * ArcHive has positive evidence of a problematic condition.
  *
  * IMPROVEMENT
  * ArcHive has identified something worth improving or reviewing,
  * but this is not evidence of an active engineering risk.
  *
  * UNVERIFIED
  * ArcHive could not confirm whether a capability/control exists.
  * Missing evidence must not automatically become negative evidence.
  */
  kind: ArchitectureAdvisorFindingKind;
  severity: ArchitectureAdvisorSeverity;
  title: string;
  description: string;
  evidence: string[];
  recommendation: string | null;
};

export type ArchitectureAdvisorAction = {
  key: string;
  priority: number;
  severity: ArchitectureAdvisorSeverity;
  category: ArchitectureAdvisorCategory;
  title: string;
  description: string;
  rationale: string;
};

export type ArchitectureAdvisorRepository = {
  id: string;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  defaultBranch: string;
  isTracked: boolean;
  updatedAt: Date;
};

export type ArchitectureAdvisorScores = {
  confidenceScore: number | null;
  maturityScore: number | null;
  architectureScore: number | null;
  capabilityScore: number | null;
  engineeringQualityScore: number | null;
  productionReadinessScore: number | null;
};

export type ArchitectureAdvisorEvidenceSummary = {
  /**
   * Tells consumers whether ArcHive currently has enough canonical
   * repository intelligence to make a meaningful Advisor judgement.
   *
   * Future me:
   * false does not mean the repository is healthy or unhealthy.
   * It means we do not yet have enough evidence to say either way.
   */
  evidenceSufficient: boolean;

  intelligenceSnapshotAvailable: boolean;
  intelligenceSnapshotCreatedAt: Date | null;

  architectureChangeCount: number;
  activeRecommendationCount: number;

  technologyCount: number;
  architectureDomainCount: number;
  repositoryTypeCount: number;
  capabilityCount: number;
};

export type ArchitectureAdvisorAssessment = {
  id: string;
  repository: ArchitectureAdvisorRepository;

  overallAssessment: string;
  maturityLabel: string;

  overallRiskScore: number;
  confidenceScore: number;

  scores: ArchitectureAdvisorScores;

  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];

  strengths: ArchitectureAdvisorFinding[];
  architectureConcerns: ArchitectureAdvisorFinding[];
  productionRisks: ArchitectureAdvisorFinding[];
  securityObservations: ArchitectureAdvisorFinding[];
  scalabilityConcerns: ArchitectureAdvisorFinding[];
  reliabilityConcerns: ArchitectureAdvisorFinding[];
  maintainabilityConcerns: ArchitectureAdvisorFinding[];
  observabilityConcerns: ArchitectureAdvisorFinding[];
  dataConcerns: ArchitectureAdvisorFinding[];
  deliveryConcerns: ArchitectureAdvisorFinding[];

  priorityActions: ArchitectureAdvisorAction[];
  recommendedNextSteps: ArchitectureAdvisorAction[];

  evidenceSummary: ArchitectureAdvisorEvidenceSummary;

  sourceIntelligenceSnapshotId: string | null;
  generatedAt: Date;
};

export type ArchitectureAdvisorHistoryItem = {
  id: string;
  repositoryId: string;
  overallAssessment: string;
  maturityLabel: string;
  overallRiskScore: number;
  confidenceScore: number;
  generatedAt: Date;
};