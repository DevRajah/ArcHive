import type {
  EvidenceResult,
} from "../evidence";

import {
  ArchitectureDomains,
  EngineeringSignals,
  RepositoryTypes,
  Technologies,
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
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    addReasoningSignal,
  } = state;

  for (const result of evidenceResults) {
    switch (result.repositoryType) {
      case RepositoryTypes.FINTECH_PLATFORM:
        add(technologies, [
          Technologies.FINANCIAL_INFRASTRUCTURE,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.FINANCIAL_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.FINANCIAL_PROCESSING,
        ]);
        break;

      case RepositoryTypes.DEVTOOL_PLATFORM:
        add(technologies, [
          Technologies.DEVELOPER_TOOLING,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.DEVELOPER_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.CODE_GENERATION,
        ]);
        break;

      case RepositoryTypes.DEVELOPER_PLATFORM:
        add(technologies, [
          Technologies.DEVELOPER_INFRASTRUCTURE,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.DEVELOPER_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.PLATFORM_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.OBSERVABILITY_PLATFORM:
        add(technologies, [
          Technologies.OBSERVABILITY,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.OBSERVABILITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.SYSTEM_MONITORING,
        ]);
        break;

      case RepositoryTypes.SECURITY_PLATFORM:
        add(technologies, [
          Technologies.SECURITY_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.SECURITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.THREAT_DETECTION,
        ]);
        break;

      case RepositoryTypes.AI_ML_PROJECT:
        add(technologies, [
          Technologies.AI_ML,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.AI_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.MACHINE_LEARNING,
        ]);
        break;

      case RepositoryTypes.MOBILE_APPLICATION:
        add(technologies, [
          Technologies.MOBILE_APPLICATION,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.MOBILE_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.MOBILE_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DATA_ENGINEERING_PROJECT:
        add(technologies, [
          Technologies.DATA_ENGINEERING,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.DATA_PIPELINES,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DATA_WORKFLOW,
        ]);
        break;

      case RepositoryTypes.SMART_TRANSPORT_PLATFORM:
        add(technologies, [
          Technologies.TRANSPORT_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.MOBILITY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ROUTE_OPTIMIZATION,
        ]);
        break;

      case RepositoryTypes.BACKEND_SERVICE:
        add(technologies, [
          Technologies.BACKEND_SERVICES,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.SERVICE_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.BACKEND_APPLICATION_DEVELOPMENT,
        ]);
        break;

      case RepositoryTypes.FRONTEND_APPLICATION:
        add(technologies, [
          Technologies.FRONTEND_ENGINEERING,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.FRONTEND_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.USER_INTERFACE_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DOCUMENTATION_HEAVY_REPOSITORY:
        add(technologies, [
          Technologies.TECHNICAL_DOCUMENTATION,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.KNOWLEDGE_MANAGEMENT,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DOCUMENTATION_ENGINEERING,
        ]);
        break;

      case RepositoryTypes.DESIGN_SYSTEM:
        add(technologies, [
          Technologies.DESIGN_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.DESIGN_SYSTEM_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.COMPONENT_DRIVEN_DEVELOPMENT,
        ]);
        break;

      case RepositoryTypes.PACKAGE_LIBRARY:
        add(technologies, [
          Technologies.PACKAGE_LIBRARIES,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.LIBRARY_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.REUSABLE_SOFTWARE_COMPONENTS,
        ]);
        break;

      case RepositoryTypes.INFRASTRUCTURE_PLATFORM:
        add(technologies, [
          Technologies.INFRASTRUCTURE_AUTOMATION,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.PLATFORM_INFRASTRUCTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.INFRASTRUCTURE_AS_CODE,
        ]);
        break;

      case RepositoryTypes.MESSAGING_PLATFORM:
        add(technologies, [
          Technologies.MESSAGING_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.EVENT_DRIVEN_ARCHITECTURE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ASYNCHRONOUS_COMMUNICATION,
        ]);
        break;

      case RepositoryTypes.ECOMMERCE_PLATFORM:
        add(technologies, [
          Technologies.COMMERCE_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.DIGITAL_COMMERCE,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.TRANSACTION_PROCESSING,
        ]);
        break;

      case RepositoryTypes.EDUCATION_PLATFORM:
        add(technologies, [
          Technologies.EDUCATIONAL_TECHNOLOGY,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.LEARNING_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.DIGITAL_LEARNING,
        ]);
        break;

      case RepositoryTypes.HEALTHCARE_PLATFORM:
        add(technologies, [
          Technologies.HEALTHCARE_TECHNOLOGY,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.HEALTH_INFORMATION_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.CLINICAL_INFORMATION_MANAGEMENT,
        ]);
        break;

      case RepositoryTypes.ENERGY_PLATFORM:
        add(technologies, [
          Technologies.ENERGY_SYSTEMS,
        ]);

        add(architectureDomains, [
          ArchitectureDomains.SMART_ENERGY_SYSTEMS,
        ]);

        add(engineeringSignals, [
          EngineeringSignals.ENERGY_MONITORING,
        ]);
        break;

      case RepositoryTypes.COLLABORATION_PLATFORM:
        add(technologies, [
          Technologies.COLLABORATION_SYSTEMS,
        ]);

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