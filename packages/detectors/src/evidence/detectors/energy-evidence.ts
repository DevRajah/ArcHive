import type {
  EvidenceContext,
} from "../evidence-types";

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalized =
      file.replace(/\\/g, "/").toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalized),
    );
  });
};

/**
 * Energy classification requires energy-domain entities and workflows.
 *
 * Generic words such as "power", "grid", or "consumption" are not enough
 * because they appear frequently in unrelated software projects.
 */
export const detectEnergyEvidence = (
  context: EvidenceContext,
): void => {
  const {
    filesChanged,
    repositoryFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasEnergyDomainStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)meters?\//,
        /(^|\/)tariffs?\//,
        /(^|\/)energy-usage\//,
        /(^|\/)energy-consumption\//,
        /(^|\/)electricity\//,
        /(^|\/)smart-grid\//,
        /(^|\/)renewables?\//,
        /(^|\/)households?\//,
        /\.meter\.(ts|js|py)$/,
        /\.tariff\.(ts|js|py)$/,
        /\.consumption\.(ts|js|py)$/,
      ],
    );

  const hasEnergyDomainModels =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "kilowatt",
        "kwh",
        "meter reading",
        "energy usage",
        "electricity tariff",
        "power generation",
        "grid demand",
        "renewable generation",
        "energy consumption",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongEnergyPurpose =
    [
      "energy monitoring platform",
      "electricity monitoring",
      "smart meter platform",
      "smart grid platform",
      "power consumption analytics",
      "renewable energy platform",
      "energy optimisation",
      "energy optimization",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasEnergyDomainStructure
  ) {
    addEvidence(
      "ENERGY_PLATFORM",
      "Detected energy-specific domain structure for meters, tariffs, electricity, or consumption",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasEnergyDomainModels
  ) {
    addEvidence(
      "ENERGY_PLATFORM",
      "Detected implemented energy-domain measurements and concepts",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongEnergyPurpose &&
    (
      hasEnergyDomainStructure ||
      hasEnergyDomainModels
    )
  ) {
    addEvidence(
      "ENERGY_PLATFORM",
      "Repository purpose explicitly describes an energy monitoring or optimisation platform",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};