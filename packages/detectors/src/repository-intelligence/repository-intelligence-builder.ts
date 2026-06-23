import { RepositoryIntelligenceReport } from "./types";

export const buildRepositoryIntelligenceReport = ({
  technologies,
  architectureDomains,
  engineeringSignals,
  reasoningSignals,
  repositoryTypes,
  repositoryPersona,
  repositoryDNA,
  capabilities,
  evidenceResults,
  engineeringQuality,
  productionReadiness,
  repositoryMaturity,
  repositoryHealth,
  technicalDebt,
  architectureDrift,
  evolutionInsights,
  strengthReport,
  weaknessReport,
  recommendationReport,
}: {
  technologies: string[];
  architectureDomains: string[];
  engineeringSignals: string[];
  reasoningSignals: string[];
  repositoryTypes: string[];
  repositoryPersona: RepositoryIntelligenceReport["identity"]["repositoryPersona"];
  repositoryDNA: RepositoryIntelligenceReport["identity"]["repositoryDNA"];
  capabilities: RepositoryIntelligenceReport["signals"]["capabilities"];
  evidenceResults: RepositoryIntelligenceReport["signals"]["evidenceResults"];
  engineeringQuality: RepositoryIntelligenceReport["assessment"]["engineeringQuality"];
  productionReadiness: RepositoryIntelligenceReport["assessment"]["productionReadiness"];
  repositoryMaturity: RepositoryIntelligenceReport["assessment"]["repositoryMaturity"];
  repositoryHealth: RepositoryIntelligenceReport["assessment"]["repositoryHealth"];
  technicalDebt: RepositoryIntelligenceReport["assessment"]["technicalDebt"];
  architectureDrift: RepositoryIntelligenceReport["assessment"]["architectureDrift"];
  evolutionInsights: RepositoryIntelligenceReport["assessment"]["evolutionInsights"];
  strengthReport: RepositoryIntelligenceReport["advisor"]["strengthReport"];
  weaknessReport: RepositoryIntelligenceReport["advisor"]["weaknessReport"];
  recommendationReport: RepositoryIntelligenceReport["advisor"]["recommendationReport"];
}): RepositoryIntelligenceReport => {
  return {
    identity: {
      primaryRepositoryType: repositoryTypes[0] || null,
      repositoryTypes,
      repositoryPersona,
      repositoryDNA,
    },

    signals: {
      technologies,
      architectureDomains,
      engineeringSignals,
      reasoningSignals,
      capabilities,
      evidenceResults,
    },

    assessment: {
      engineeringQuality,
      productionReadiness,
      repositoryMaturity,
      repositoryHealth,
      technicalDebt,
      architectureDrift,
      evolutionInsights,
    },

    advisor: {
      strengthReport,
      weaknessReport,
      recommendationReport,
    },
  };
};