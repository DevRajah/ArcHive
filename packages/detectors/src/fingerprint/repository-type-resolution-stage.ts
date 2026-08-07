import type {
  EvidenceResult,
} from "../evidence";

import type {
  FingerprintState,
} from "./shared";

/**
 * Generic classifications describe the implementation language rather than
 * the actual purpose of the product.
 *
 * They remain useful as a fallback when no stronger repository purpose exists.
 */
const genericRepositoryTypes =
  new Set<string>([
    "JAVASCRIPT_TYPESCRIPT_PROJECT",
    "GENERAL_ENGINEERING_PROJECT",
  ]);

/**
 * These often describe capabilities inside a larger product.
 *
 * For example:
 *
 * LedgerFlow can be a backend service without BACKEND_SERVICE needing to
 * become its primary identity.
 *
 * ArcHive can contain frontend code without FRONTEND_APPLICATION becoming
 * its product purpose.
 */
const secondaryRepositoryTypes =
  new Set<string>([
    "BACKEND_SERVICE",
    "FRONTEND_APPLICATION",
    "PACKAGE_LIBRARY",
    "MESSAGING_PLATFORM",
    "DOCUMENTATION_REPOSITORY",
    "DOCUMENTATION_HEAVY_REPOSITORY",
    "INFRASTRUCTURE_REPOSITORY",
    "INFRASTRUCTURE_PLATFORM",
  ]);

/**
 * Evidence at or above this score is strong enough to participate in final
 * repository-purpose resolution.
 */
const STRONG_PURPOSE_THRESHOLD = 50;

/**
 * Gives evidence-aware repository-purpose detection the final say after
 * legacy classification has completed.
 *
 * Future me:
 * The legacy classifier still exists for backwards compatibility and for
 * technology/architecture signals.
 *
 * It must not be allowed to turn strong evidence-based repository identity
 * into a collection of unrelated keyword classifications.
 */
export const applyRepositoryTypeResolutionStage = ({
  evidenceResults,
  state,
}: {
  evidenceResults: EvidenceResult[];
  state: FingerprintState;
}): void => {
  const strongPurposeEvidence =
    evidenceResults
      .filter(
        (result) =>
          result.totalScore >=
          STRONG_PURPOSE_THRESHOLD,
      )
      .sort(
        (left, right) =>
          right.totalScore -
          left.totalScore,
      );

  /**
   * No strong evidence means we keep the existing fallback behaviour.
   */
  if (
    strongPurposeEvidence.length === 0
  ) {
    return;
  }

  const strongestPurpose =
    strongPurposeEvidence[0]
      .repositoryType;

  const stronglySupportedTypes =
    new Set(
      strongPurposeEvidence.map(
        (result) =>
          result.repositoryType,
      ),
    );

  /**
   * A meaningful evidence-backed purpose makes generic language identity
   * unnecessary.
   */
  for (
    const genericType
    of genericRepositoryTypes
  ) {
    state.repositoryTypes.delete(
      genericType,
    );
  }

  /**
   * Remove capability-style classifications unless that classification has
   * independently earned strong evidence.
   */
  for (
    const secondaryType
    of secondaryRepositoryTypes
  ) {
    if (
      secondaryType !==
        strongestPurpose &&
      !stronglySupportedTypes.has(
        secondaryType,
      )
    ) {
      state.repositoryTypes.delete(
        secondaryType,
      );
    }
  }

  /**
   * Remove legacy domain classifications that were introduced without strong
   * evidence.
   *
   * Example:
   *
   * ArcHive may receive ENERGY_PLATFORM from an old "power" keyword match.
   * Since ENERGY_PLATFORM has no strong EvidenceResult, it disappears here.
   */
  for (
    const repositoryType
    of Array.from(
      state.repositoryTypes,
    )
  ) {
    if (
      repositoryType ===
      strongestPurpose
    ) {
      continue;
    }

    if (
      stronglySupportedTypes.has(
        repositoryType,
      )
    ) {
      continue;
    }

    state.repositoryTypes.delete(
      repositoryType,
    );
  }

  /**
   * Guarantee that the strongest evidence-backed identity survives cleanup.
   */
  state.repositoryTypes.add(
    strongestPurpose,
  );
};