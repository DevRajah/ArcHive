import {
  calculateEvidenceResults,
  createEvidenceContext,
  detectAiEvidence,
  detectBackendServiceEvidence,
  detectCollaborationEvidence,
  detectDataEngineeringEvidence,
  detectDesignSystemEvidence,
  detectDeveloperPlatformEvidence,
  detectDeveloperToolEvidence,
  detectDocumentationEvidence,
  detectEcommerceEvidence,
  detectEducationEvidence,
  detectEnergyEvidence,
  detectEngineeringIntelligenceEvidence,
  detectFintechEvidence,
  detectFrontendEvidence,
  detectHealthcareEvidence,
  detectInfrastructureEvidence,
  detectMessagingEvidence,
  detectMobileEvidence,
  detectObservabilityEvidence,
  detectPackageSdkEvidence,
  detectSecurityEvidence,
  detectTransportEvidence,
} from "../evidence";

import type {
  RepositoryFileContent,
} from "../evidence";

import {
  runTechnologyDetectors,
} from "../technologies";

/**
 * Builds all evidence required by the repository fingerprint pipeline.
 *
 * Future me:
 * This stage receives repository paths, commit context, and any actual
 * repository files fetched by the API. Evidence providers then extract
 * dependencies, imports, languages, and configuration signals.
 */
export const buildEvidenceStage = (
  filesChanged: string[],
  commitMessages: string[],
  repositoryContext: string,
  repositoryFiles: RepositoryFileContent[] = [],
) => {
  const evidenceContext =
    createEvidenceContext({
      filesChanged,
      commitMessages,
      repositoryContext,
      repositoryFiles,
    });

  runTechnologyDetectors(
    evidenceContext,
  );

  detectEngineeringIntelligenceEvidence(
    evidenceContext,
  );

  detectFintechEvidence(
    evidenceContext,
  );

  detectDeveloperToolEvidence(
    evidenceContext,
  );

  detectDeveloperPlatformEvidence(
    evidenceContext,
  );

  detectObservabilityEvidence(
    evidenceContext,
  );

  detectSecurityEvidence(
    evidenceContext,
  );

  detectAiEvidence(
    evidenceContext,
  );

  detectMobileEvidence(
    evidenceContext,
  );

  detectTransportEvidence(
    evidenceContext,
  );

  detectDataEngineeringEvidence(
    evidenceContext,
  );

  detectBackendServiceEvidence(
    evidenceContext,
  );

  detectFrontendEvidence(
    evidenceContext,
  );

  detectDocumentationEvidence(
    evidenceContext,
  );

  detectDesignSystemEvidence(
    evidenceContext,
  );

  detectPackageSdkEvidence(
    evidenceContext,
  );

  detectInfrastructureEvidence(
    evidenceContext,
  );

  detectMessagingEvidence(
    evidenceContext,
  );

  detectHealthcareEvidence(
    evidenceContext,
  );

  detectEducationEvidence(
    evidenceContext,
  );

  detectEnergyEvidence(
    evidenceContext,
  );

  detectEcommerceEvidence(
    evidenceContext,
  );

  detectCollaborationEvidence(
    evidenceContext,
  );

  return {
    evidenceContext,

    evidenceResults:
      calculateEvidenceResults(
        evidenceContext.evidenceItems,
      ),
  };
};