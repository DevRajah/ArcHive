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
  /**
   * Detect engineering capabilities from the same canonical evidence
   * context used by the rest of the fingerprint pipeline.
   *
   * Future me:
   * Do not reconstruct capability evidence from combined repository
   * text here. That previously allowed descriptive repository language
   * and detector-related paths to masquerade as implementation evidence.
   */
  const capabilities =
    detectEngineeringCapabilities({
      evidenceContext,
    });
  /**
 * Realtime architecture is promoted only from a confirmed
 * implementation-backed realtime capability.
 *
 * Future me:
 * Do not recreate realtime architecture from repository prose here.
 * detectRealtimeCapability() already requires confirmed technology
 * evidence from the canonical evidence pipeline.
 */
const hasRealtimeCapability =
  capabilities.some(
    (capability) =>
      capability.key ===
      "REALTIME_SYSTEMS",
  );

if (hasRealtimeCapability) {
  architectureDomains.add(
    "REALTIME_SYSTEMS",
  );

  engineeringSignals.add(
    "REALTIME_INFRASTRUCTURE",
  );

  addReasoningSignal(
    "Confirmed realtime implementation evidence supports realtime architecture.",
  );
}
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