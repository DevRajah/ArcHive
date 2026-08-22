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
      const normalizedPath =
        file.path
          .replace(/\\/g, "/")
          .toLowerCase();

      const content =
        file.content;

      /**
       * Energy vocabulary alone is not enough.
       *
       * ArcHive itself contains an energy detector whose source code
       * lists terms such as "kwh", "meter reading", and
       * "energy consumption". Those strings describe what ArcHive
       * knows how to detect; they do not mean ArcHive implements
       * an energy-monitoring product.
       *
       * Require the implementation file itself to live in an
       * energy-domain context before its contents can establish
       * ENERGY_PLATFORM evidence.
       */
      const hasEnergyDomainPath =
        [
          /(^|\/)energy([./_-]|$)/,
          /(^|\/)meters?([./_-]|$)/,
          /(^|\/)tariffs?([./_-]|$)/,
          /(^|\/)electricity([./_-]|$)/,
          /(^|\/)consumption([./_-]|$)/,
          /(^|\/)households?([./_-]|$)/,
          /(^|\/)smart-grid([./_-]|$)/,
          /(^|\/)renewables?([./_-]|$)/,
          /(^|\/)power-usage([./_-]|$)/,
        ].some((pattern) =>
          pattern.test(
            normalizedPath,
          ),
        );

      if (!hasEnergyDomainPath) {
        return false;
      }

      /**
       * Normalize common identifier separators so implementation names such as:
       *
       * meterReading
       * meter_reading
       * meter-reading
       *
       * can all be evaluated as the same domain concept.
       *
       * This is safe here because we already required the file itself to live
       * inside an energy-domain implementation path.
       */
      const normalizedContent =
        content
          // Split camelCase:
          // meterReading -> meter reading
          .replace(
            /([a-z0-9])([A-Z])/g,
            "$1 $2",
          )

          // Treat common identifier separators as spaces.
          .replace(
            /[_-]+/g,
            " ",
          )

          .toLowerCase();


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


      return (
        signals.filter((signal) =>
          normalizedContent.includes(
            signal,
          ),
        ).length >= 2
      );
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