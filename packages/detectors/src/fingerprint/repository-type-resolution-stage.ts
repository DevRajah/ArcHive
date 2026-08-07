import type {
  EvidenceResult,
} from "../evidence";

import type {
  RepositoryType,
} from "../constants";

import type {
  FingerprintState,
} from "./shared";

/**
 * Repository types that describe the actual purpose or product identity
 * of a repository.
 *
 * Future me:
 * These answer:
 *
 * "What is this repository fundamentally for?"
 *
 * They are different from implementation capabilities such as:
 *
 * BACKEND_SERVICE
 * FRONTEND_APPLICATION
 * PACKAGE_LIBRARY
 * MESSAGING_PLATFORM
 *
 * Those capabilities still exist elsewhere in ArcHive intelligence,
 * but they should not compete with the repository's product identity.
 */
const PRIMARY_PURPOSE_TYPES =
  new Set<RepositoryType>([
    "ENGINEERING_INTELLIGENCE_PLATFORM",
    "DEVTOOL_PLATFORM",
    "FINTECH_PLATFORM",
    "OBSERVABILITY_PLATFORM",
    "SECURITY_PLATFORM",
    "AI_ML_PROJECT",
    "DEVELOPER_PLATFORM",
    "DATA_ENGINEERING_PROJECT",
    "SMART_TRANSPORT_PLATFORM",
    "ENERGY_PLATFORM",
    "HEALTHCARE_PLATFORM",
    "ECOMMERCE_PLATFORM",
    "EDUCATION_PLATFORM",
    "COLLABORATION_PLATFORM",
    "INFRASTRUCTURE_PLATFORM",
    "MOBILE_APPLICATION",
  ]);

/**
 * Types that describe implementation shape rather than overall product
 * identity.
 *
 * They are useful intelligence, but should not become the repository's
 * primary purpose when stronger domain/product evidence exists.
 */
const CAPABILITY_STYLE_TYPES =
  new Set<RepositoryType>([
    "BACKEND_SERVICE",
    "FRONTEND_APPLICATION",
    "PACKAGE_LIBRARY",
    "MESSAGING_PLATFORM",
    "DOCUMENTATION_HEAVY_REPOSITORY",
    "JAVASCRIPT_TYPESCRIPT_PROJECT",
  ]);

/**
 * Minimum evidence required for a purpose classification to be trusted.
 */
const STRONG_PURPOSE_THRESHOLD = 50;

/**
 * Some repository purposes are inherently more specific than others.
 *
 * This priority is used only when multiple purpose detectors independently
 * produce strong evidence.
 *
 * Evidence score still matters first.
 */
const PURPOSE_PRIORITY:
  RepositoryType[] = [
    "ENGINEERING_INTELLIGENCE_PLATFORM",
    "DEVTOOL_PLATFORM",
    "FINTECH_PLATFORM",
    "SECURITY_PLATFORM",
    "OBSERVABILITY_PLATFORM",
    "AI_ML_PROJECT",
    "DATA_ENGINEERING_PROJECT",
    "SMART_TRANSPORT_PLATFORM",
    "ENERGY_PLATFORM",
    "HEALTHCARE_PLATFORM",
    "ECOMMERCE_PLATFORM",
    "EDUCATION_PLATFORM",
    "COLLABORATION_PLATFORM",
    "DEVELOPER_PLATFORM",
    "INFRASTRUCTURE_PLATFORM",
    "MOBILE_APPLICATION",
  ];

const getPurposePriority = (
  repositoryType: RepositoryType,
): number => {
  const index =
    PURPOSE_PRIORITY.indexOf(
      repositoryType,
    );

  return index === -1
    ? Number.MAX_SAFE_INTEGER
    : index;
};

/**
 * Resolves the final repository identity after all evidence detectors and
 * legacy stages have run.
 *
 * This is the final authority for `state.repositoryTypes`.
 *
 * Future me:
 *
 * Older ArcHive classifiers are intentionally still allowed to run because
 * architecture, technology and reasoning features may depend on them.
 *
 * They are NOT allowed to determine repository identity anymore when
 * structured evidence has already established a trustworthy purpose.
 */
export const applyRepositoryTypeResolutionStage = ({
  evidenceResults,
  state,
}: {
  evidenceResults: EvidenceResult[];
  state: FingerprintState;
}): void => {
  /**
   * Find evidence-backed PRODUCT PURPOSES only.
   *
   * BACKEND_SERVICE may score very highly for LedgerFlow, for example,
   * but that does not mean LedgerFlow's purpose is "backend service".
   *
   * Its actual product purpose is FINTECH_PLATFORM.
   */
  const strongPurposeCandidates =
    evidenceResults
      .filter(
        (result) =>
          PRIMARY_PURPOSE_TYPES.has(
            result.repositoryType,
          ) &&
          result.totalScore >=
            STRONG_PURPOSE_THRESHOLD,
      )
      .sort((left, right) => {
        /**
         * Stronger evidence wins first.
         */
        if (
          left.totalScore !==
          right.totalScore
        ) {
          return (
            right.totalScore -
            left.totalScore
          );
        }

        /**
         * If two purposes have the same score,
         * prefer the more specific purpose.
         */
        return (
          getPurposePriority(
            left.repositoryType,
          ) -
          getPurposePriority(
            right.repositoryType,
          )
        );
      });

  /**
   * BEST CASE:
   *
   * We have strong evidence for a real repository purpose.
   *
   * From this point forward, that purpose becomes the canonical repository
   * identity.
   */
  if (
    strongPurposeCandidates.length > 0
  ) {
    const winner =
      strongPurposeCandidates[0];

    /**
     * Repository identity should not become an uncontrolled collection
     * of classifications.
     *
     * Technologies, architecture domains, capabilities, and engineering
     * signals already describe the repository's supporting characteristics.
     *
     * `repositoryTypes` now answers one question:
     *
     * "What is this repository fundamentally for?"
     */
    state.repositoryTypes.clear();

    state.repositoryTypes.add(
      winner.repositoryType,
    );

    state.addReasoningSignal(
      `Repository purpose resolved as ${winner.repositoryType} from structured evidence with score ${winner.totalScore}.`,
    );

    console.log(
      "[REPOSITORY PURPOSE RESOLVED]",
      {
        repositoryType:
          winner.repositoryType,

        score:
          winner.totalScore,

        confidence:
          winner.confidence,

        competingPurposes:
          strongPurposeCandidates
            .slice(1)
            .map((candidate) => ({
              repositoryType:
                candidate.repositoryType,

              score:
                candidate.totalScore,
            })),
      },
    );

    return;
  }

  /**
   * FALLBACK:
   *
   * No specialised product/domain purpose reached the confidence threshold.
   *
   * In that case we can retain the strongest evidence-backed capability
   * instead of trusting arbitrary legacy keyword classifications.
   */
  const capabilityFallback =
    evidenceResults
      .filter(
        (result) =>
          CAPABILITY_STYLE_TYPES.has(
            result.repositoryType,
          ),
      )
      .sort(
        (left, right) =>
          right.totalScore -
          left.totalScore,
      )[0];

  if (capabilityFallback) {
    state.repositoryTypes.clear();

    state.repositoryTypes.add(
      capabilityFallback.repositoryType,
    );

    state.addReasoningSignal(
      `Repository purpose fell back to ${capabilityFallback.repositoryType} because no specialised product purpose reached the evidence threshold.`,
    );

    console.log(
      "[REPOSITORY PURPOSE FALLBACK]",
      {
        repositoryType:
          capabilityFallback.repositoryType,

        score:
          capabilityFallback.totalScore,

        confidence:
          capabilityFallback.confidence,
      },
    );

    return;
  }

  /**
   * LAST RESORT:
   *
   * If structured evidence genuinely knows nothing useful, retain only a
   * safe generic TypeScript/JavaScript classification when legacy detection
   * produced it.
   *
   * Do not preserve random legacy domain classifications here.
   */
  const hasGenericProjectType =
    state.repositoryTypes.has(
      "JAVASCRIPT_TYPESCRIPT_PROJECT",
    );

  state.repositoryTypes.clear();

  if (hasGenericProjectType) {
    state.repositoryTypes.add(
      "JAVASCRIPT_TYPESCRIPT_PROJECT",
    );
  }
};