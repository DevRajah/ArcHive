import type {
  AddTechnology,
  EvidenceCategory,
  EvidenceContext,
  EvidenceContextInput,
  EvidenceItem,
  EvidenceStrength,
  TechnologyEvidence,
  TechnologyEvidenceSource,
  TechnologyEvidenceStatus,
} from "./evidence-types";

import type {
  RepositoryType,
} from "../constants";

const normalizeText = (
  values: Array<string | undefined>,
): string => {
  return values
    .filter(
      (value): value is string =>
        Boolean(value),
    )
    .join(" ")
    .toLowerCase();
};

const strengthPriority: Record<
  EvidenceStrength,
  number
> = {
  WEAK: 1,
  MEDIUM: 2,
  STRONG: 3,
};

const statusPriority: Record<
  TechnologyEvidenceStatus,
  number
> = {
  MENTIONED: 1,
  LIKELY: 2,
  CONFIRMED: 3,
};

/**
 * Older detectors do not yet provide provenance.
 *
 * Until each detector is migrated, infer a conservative status from its
 * existing strength and weight instead of automatically confirming it.
 */
const buildLegacyTechnologyEvidence = ({
  name,
  reason,
  weight,
  strength,
}: {
  name: string;
  reason: string;
  weight: number;
  strength: EvidenceStrength;
}): TechnologyEvidence => {
  let status:
    TechnologyEvidenceStatus =
    "MENTIONED";

  if (
    strength === "STRONG" &&
    weight >= 70
  ) {
    status = "CONFIRMED";
  } else if (
    strength === "STRONG" ||
    weight >= 45
  ) {
    status = "LIKELY";
  }

  return {
    name,
    reason,
    weight,
    strength,

    /**
     * Legacy calls do not reveal where the match came from.
     * UNKNOWN evidence must not automatically be trusted as confirmed.
     */
    source: "UNKNOWN",

    evidence:
      "Legacy detector did not provide evidence provenance.",

    status,
  };
};

const isStructuredTechnologyEvidence = (
  value: string | TechnologyEvidence,
): value is TechnologyEvidence => {
  return (
    typeof value === "object" &&
    value !== null
  );
};

const chooseStrongerTechnologyEvidence = (
  current: TechnologyEvidence,
  incoming: TechnologyEvidence,
): TechnologyEvidence => {
  const currentStatus =
    statusPriority[current.status];

  const incomingStatus =
    statusPriority[incoming.status];

  if (incomingStatus > currentStatus) {
    return incoming;
  }

  if (incomingStatus < currentStatus) {
    return current;
  }

  const currentStrength =
    strengthPriority[
      current.strength
    ];

  const incomingStrength =
    strengthPriority[
      incoming.strength
    ];

  if (
    incomingStrength >
    currentStrength
  ) {
    return incoming;
  }

  if (
    incomingStrength <
    currentStrength
  ) {
    return current;
  }

  return incoming.weight >
    current.weight
    ? incoming
    : current;
};

export const createEvidenceContext = ({
  filesChanged,
  commitMessages,
  repositoryContext = "",
}: EvidenceContextInput): EvidenceContext => {
  const evidenceItems:
    EvidenceItem[] = [];

  const technologyEvidence:
    TechnologyEvidence[] = [];

  const filePathText =
    normalizeText(filesChanged);

  const commitText =
    normalizeText(commitMessages);

  const repositoryContextText =
    repositoryContext
      .toLowerCase()
      .trim();

  /**
   * Structural evidence currently contains repository file paths.
   *
   * Later, we will extend the intelligence input with actual dependency,
   * import and configuration contents.
   */
  const structuralText =
    filePathText;

  /**
   * Commit messages and README-style repository context can explain
   * intent, but they cannot prove that a technology is implemented.
   */
  const descriptiveText =
    normalizeText([
      commitText,
      repositoryContextText,
    ]);

  /**
   * Kept only while older detectors are migrated.
   */
  const combinedText =
    normalizeText([
      filePathText,
      commitText,
      repositoryContextText,
    ]);

  const addEvidence = (
    repositoryType:
      RepositoryType,

    label:
      string,

    weight:
      number,

    category:
      EvidenceCategory,

    strength:
      EvidenceStrength,
  ) => {
    evidenceItems.push({
      repositoryType,
      label,
      weight,
      category,
      strength,
    });
  };

  const addTechnology:
    AddTechnology = (
      technologyOrName:
        TechnologyEvidence | string,

      legacyReason?: string,

      legacyWeight?: number,

      legacyStrength?:
        EvidenceStrength,
    ) => {
      const technology =
        isStructuredTechnologyEvidence(
          technologyOrName,
        )
          ? technologyOrName
          : buildLegacyTechnologyEvidence({
              name:
                technologyOrName,

              reason:
                legacyReason ??
                "Technology detected by a legacy detector.",

              weight:
                legacyWeight ?? 0,

              strength:
                legacyStrength ??
                "WEAK",
            });

      const normalizedName =
        technology.name
          .trim()
          .toLowerCase();

      if (!normalizedName) {
        return;
      }

      const existingIndex =
        technologyEvidence.findIndex(
          (item) =>
            item.name
              .trim()
              .toLowerCase() ===
            normalizedName,
        );

      if (existingIndex === -1) {
        technologyEvidence.push(
          technology,
        );

        return;
      }

      /**
       * Multiple detectors may identify the same technology.
       *
       * Keep the strongest individual evidence for now. Later, we can
       * preserve every evidence item and calculate a combined score.
       */
      technologyEvidence[
        existingIndex
      ] =
        chooseStrongerTechnologyEvidence(
          technologyEvidence[
            existingIndex
          ],
          technology,
        );
    };

  return {
    filesChanged,
    commitMessages,

    combinedText,

    filePathText,
    commitText,
    repositoryContextText,
    structuralText,
    descriptiveText,

    evidenceItems,
    technologyEvidence,

    addEvidence,
    addTechnology,
  };
};