import type {
  EvidenceContext,
} from "../evidence";

import type {
  RepositoryType,
} from "../constants";

import {
  detectEngineeringCapabilities,
} from "../capabilities";

import {
  buildRepositoryDNA,
} from "../dna";

import {
  inferRepositoryPersona,
} from "../persona";

import {
  buildEngineeringQuality,
  createEngineeringQualityContext,
  runQualityDetectors,
} from "../engineering-quality";

import {
  add,
  type FingerprintState,
} from "./shared";

import {
  getEngineeringSignalsForTechnology,
} from "./technology-engineering-signal";

export const buildEngineeringStage = ({
  filesChanged,
  commitMessages,
  combinedText,
  evidenceContext,
  state,
}: {
  filesChanged: string[];
  commitMessages: string[];
  combinedText: string;
  evidenceContext: EvidenceContext;
  state: FingerprintState;
}) => {
  const {
    technologies,
    architectureDomains,
    engineeringSignals,
    repositoryTypes,
    addReasoningSignal,
  } = state;

  /**
   * Detect the engineering capabilities supported by the repository.
   */
  const capabilities =
    detectEngineeringCapabilities({
      filesChanged,
      commitMessages,

      /**
       * Preserve the current behaviour exactly.
       *
       * The existing implementation passes combinedText here rather
       * than the original repositoryContext.
       */
      repositoryContext:
        combinedText,
    });

  const repositoryPersona =
    inferRepositoryPersona(
      Array.from(
        repositoryTypes,
      ) as RepositoryType[],

      capabilities.map(
        (capability) =>
          capability.key,
      ),
    );

  const repositoryDNA =
    buildRepositoryDNA({
      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      technologies:
        Array.from(
          technologies,
        ),

      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      capabilities,
    });

  const qualityContext =
    createEngineeringQualityContext({
      technologies:
        Array.from(
          technologies,
        ),

      architectureDomains:
        Array.from(
          architectureDomains,
        ),

      repositoryTypes:
        Array.from(
          repositoryTypes,
        ),

      capabilities,

      repositoryDNA,

      repositoryPersona,
    });

  runQualityDetectors(
    qualityContext,
  );

  const engineeringQuality =
    buildEngineeringQuality(
      qualityContext,
    );

  /**
   * Only implementation-backed technologies enter the official inventory.
   *
   * This intentionally happens after engineering quality calculation,
   * matching the order of the previous implementation.
   */
  for (
    const technology of
    evidenceContext.technologyEvidence
  ) {
    if (
      technology.status !==
      "CONFIRMED"
    ) {
      continue;
    }

    /**
     * Keep the concrete implementation in the technology inventory.
     *
     * Example:
     * express-rate-limit belongs here as the actual detected package.
     */
    add(
      technologies,
      [
        technology.name,
      ],
    );

    /**
     * A concrete technology may also imply a higher-level engineering
     * behaviour.
     *
     * Future me:
     * Do not put generic concepts such as "Rate Limiting" back into the
     * technology inventory. The concrete implementation remains a
     * technology, while the behaviour is represented as an engineering
     * signal.
     *
     * Example:
     * express-rate-limit -> technologies
     * RATE_LIMITING      -> engineeringSignals
     */
    add(
      engineeringSignals,
      getEngineeringSignalsForTechnology(
        technology.name,
      ),
    );

    addReasoningSignal(
      `${technology.reason} Evidence: ${technology.evidence}`,
    );
  }

  return {
    capabilities,
    repositoryPersona,
    repositoryDNA,
    engineeringQuality,
  };
};