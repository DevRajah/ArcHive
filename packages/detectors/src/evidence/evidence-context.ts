import type {
  AddTechnology,
  EvidenceCategory,
  EvidenceContext,
  EvidenceContextInput,
  EvidenceItem,
  EvidenceStrength,
  TechnologyEvidence,
  TechnologyEvidenceStatus,
} from "./evidence-types";

import type {
  RepositoryType,
} from "../constants";

import {
  collectConfigurationEvidence,
  collectDependencyEvidence,
  collectImportEvidence,
  collectLanguageEvidence,
} from "./providers";

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

  /**
   * Providers populate these collections after the context object
   * has been created.
   */
  const dependencyFiles =
    new Set<string>();

  const importFiles =
    new Set<string>();

  const configurationFiles =
    new Set<string>();

  const languages =
    new Set<string>();

  const filePathText =
    normalizeText(filesChanged);

  const commitText =
    normalizeText(commitMessages);

  const repositoryContextText =
    repositoryContext
      .toLowerCase()
      .trim();

  const structuralText =
    filePathText;

  const descriptiveText =
    normalizeText([
      commitText,
      repositoryContextText,
    ]);

  /**
   * Retained temporarily while legacy detectors are being migrated.
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

  /**
   * Create the context first so evidence providers can populate its
   * dependency, import, configuration and language collections.
   */
  const context: EvidenceContext = {
    filesChanged,
    commitMessages,

    dependencyFiles,
    importFiles,
    configurationFiles,
    languages,

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

  /**
   * Evidence providers collect structured repository information before
   * the technology and repository-purpose detectors run.
   */
  collectDependencyEvidence(
    context,
  );

  collectImportEvidence(
    context,
  );

  collectConfigurationEvidence(
    context,
  );

  collectLanguageEvidence(
    context,
  );

  return context;
};