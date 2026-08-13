import type {
  EvidenceResult,
} from "../evidence";

import {
  ArchitectureDomains,
  EngineeringSignals,
  RepositoryTypes,
} from "../constants";

import {
  add,
  type FingerprintState,
} from "./shared";

/**
 * Applies repository-purpose evidence to the shared fingerprint state.
 *
 * Future me:
 * This stage converts repository-type conclusions such as
 * FINTECH_PLATFORM or BACKEND_SERVICE into the technologies,
 * architecture domains, and engineering signals used downstream.
 */
export const applyRepositoryPurposeStage = ({
  evidenceResults,
  state,
}: {
  evidenceResults: EvidenceResult[];
  state: FingerprintState;
}): void => {
  const {
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    addReasoningSignal,
  } = state;

  for (const result of evidenceResults) {
    switch (result.repositoryType) {
      case RepositoryTypes.FINTECH_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.FINANCIAL_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.FINANCIAL_PROCESSING,
        ]);
        break;

      case RepositoryTypes.DEVTOOL_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.DEVELOPER_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.CODE_GENERATION,
        ]);
        break;

      case RepositoryTypes.DEVELOPER_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.DEVELOPER_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.PLATFORM_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.OBSERVABILITY_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.OBSERVABILITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.SYSTEM_MONITORING,
        ]);
        break;

      case RepositoryTypes.SECURITY_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.SECURITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.THREAT_DETECTION,
        ]);
        break;

      case RepositoryTypes.AI_ML_PROJECT:


        add(architectureDomains, [
          ArchitectureDomains.AI_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.MACHINE_LEARNING,
        ]);
        break;

      case RepositoryTypes.MOBILE_APPLICATION:


        add(architectureDomains, [
          ArchitectureDomains.MOBILE_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.MOBILE_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DATA_ENGINEERING_PROJECT:


        add(architectureDomains, [
          ArchitectureDomains.DATA_PIPELINES,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DATA_WORKFLOW,
        ]);
        break;

      case RepositoryTypes.SMART_TRANSPORT_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.MOBILITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ROUTE_OPTIMIZATION,
        ]);
        break;

      case RepositoryTypes.BACKEND_SERVICE:


        add(architectureDomains, [
          ArchitectureDomains.SERVICE_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.BACKEND_APPLICATION_DEVELOPMENT,
        ]);
        break;

      case RepositoryTypes.FRONTEND_APPLICATION:


        add(architectureDomains, [
          ArchitectureDomains.FRONTEND_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.USER_INTERFACE_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DOCUMENTATION_HEAVY_REPOSITORY:


        add(architectureDomains, [
          ArchitectureDomains.KNOWLEDGE_MANAGEMENT,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DOCUMENTATION_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DESIGN_SYSTEM:


        add(architectureDomains, [
          ArchitectureDomains.DESIGN_SYSTEM_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.COMPONENT_DRIVEN_DEVELOPMENT,
        ]);
        break;

      case RepositoryTypes.PACKAGE_LIBRARY:

        add(architectureDomains, [
          ArchitectureDomains.LIBRARY_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.REUSABLE_SOFTWARE_COMPONENTS,
        ]);
        break;

      case RepositoryTypes.INFRASTRUCTURE_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.PLATFORM_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.INFRASTRUCTURE_AS_CODE,
        ]);
        break;

      case RepositoryTypes.MESSAGING_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.EVENT_DRIVEN_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ASYNCHRONOUS_COMMUNICATION,
        ]);
        break;

      case RepositoryTypes.ECOMMERCE_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.DIGITAL_COMMERCE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.TRANSACTION_PROCESSING,
        ]);
        break;

      case RepositoryTypes.EDUCATION_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.LEARNING_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DIGITAL_LEARNING,
        ]);
        break;

      case RepositoryTypes.HEALTHCARE_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.HEALTH_INFORMATION_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.CLINICAL_INFORMATION_MANAGEMENT,
        ]);
        break;

      case RepositoryTypes.ENERGY_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.SMART_ENERGY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ENERGY_MONITORING,
        ]);
        break;

      case RepositoryTypes.COLLABORATION_PLATFORM:


        add(architectureDomains, [
          ArchitectureDomains.COLLABORATIVE_COMPUTING,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.REALTIME_COLLABORATION,
        ]);
        break;
    }

    add(repositoryTypes, [
      result.repositoryType,
    ]);

    for (const evidence of result.evidence) {
      addReasoningSignal(evidence);
    }
  }
};