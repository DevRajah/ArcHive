import { ArchitectureDriftReport } from "../architecture-drift";
import { CapabilityResult } from "../capabilities";
import { RepositoryDNA } from "../dna";
import { EngineeringQualityResult } from "../engineering-quality";
import { EvolutionInsightsReport } from "../repository-evolution";
import { ProductionReadiness } from "../production-readiness";
import { RecommendationReport } from "../recommendations";
import { RepositoryHealth } from "../repository-health";
import { RepositoryMaturity } from "../maturity";
import { RepositoryPersona } from "../persona";
import { StrengthReport } from "../strengths";
import { TechnicalDebtReport } from "../technical-debt";
import { WeaknessReport } from "../weaknesses";
import { EvidenceResult } from "../evidence";

export type RepositoryIntelligenceReport = {
  identity: {
    repositoryTypes: string[];
    repositoryPersona: RepositoryPersona;
    repositoryDNA: RepositoryDNA;
  };

  signals: {
    technologies: string[];
    architectureDomains: string[];
    engineeringSignals: string[];
    reasoningSignals: string[];
    capabilities: CapabilityResult[];
    evidenceResults: EvidenceResult[];
  };

  assessment: {
    engineeringQuality: EngineeringQualityResult;
    productionReadiness: ProductionReadiness;
    repositoryMaturity: RepositoryMaturity;
    repositoryHealth: RepositoryHealth;
    technicalDebt: TechnicalDebtReport;
    architectureDrift: ArchitectureDriftReport;
    evolutionInsights: EvolutionInsightsReport;
  };

  advisor: {
    strengthReport: StrengthReport;
    weaknessReport: WeaknessReport;
    recommendationReport: RecommendationReport;
  };
};