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

import {
    runTechnologyDetectors,
} from "../technologies";

export const buildEvidenceStage = (
    filesChanged: string[],
    commitMessages: string[],
    repositoryContext: string,
) => {

    const evidenceContext =
        createEvidenceContext({

            filesChanged,

            commitMessages,

            repositoryContext,

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