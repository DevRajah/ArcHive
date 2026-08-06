import type {
  EvidenceContext,
} from "../evidence-types";

const CLI_PACKAGES = [
  "commander",
  "yargs",
  "inquirer",
  "@inquirer/prompts",
  "oclif",
  "@oclif/core",
  "clipanion",
  "cac",
  "prompts",
  "meow",
];

const CODE_GENERATION_PACKAGES = [
  "hygen",
  "plop",
  "yeoman-generator",
  "ts-morph",
  "handlebars",
  "mustache",
  "ejs",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalizedPath = file
      .replace(/\\/g, "/")
      .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects developer-facing command-line tools, code generators,
 * scaffolding systems, and engineering automation utilities.
 *
 * Future me:
 * A repository must not become a DEVTOOL_PLATFORM merely because its README
 * mentions CLI commands, generators, SDKs, plugins, or developer tooling.
 *
 * We require executable CLI structure, generation templates, package-level
 * command definitions, or direct code-generation implementation.
 */
export const detectDeveloperToolEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    descriptiveText,
    addEvidence,
  } = context;

  /**
   * Engineering-intelligence products are classified separately.
   *
   * ArcHive may provide developer-facing tooling, but that should not make
   * DEVTOOL_PLATFORM its primary repository purpose.
   */
  const isEngineeringIntelligenceRepository =
    [
      "engineering intelligence",
      "repository intelligence",
      "architecture intelligence",
      "repository fingerprint",
      "technology fingerprint",
      "architecture drift",
      "repository health",
      "repository maturity",
      "repository analysis platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    isEngineeringIntelligenceRepository
  ) {
    return;
  }

  const hasCliDependency =
    hasAnySetValue(
      dependencies,
      CLI_PACKAGES,
    );

  const hasCliImport =
    hasAnySetValue(
      imports,
      CLI_PACKAGES,
    );

  const hasGenerationDependency =
    hasAnySetValue(
      dependencies,
      CODE_GENERATION_PACKAGES,
    );

  const hasGenerationImport =
    hasAnySetValue(
      imports,
      CODE_GENERATION_PACKAGES,
    );

  const hasCliEntrypoint =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)bin\/[^/]+\.[jt]s$/,
        /(^|\/)cli\.[jt]s$/,
        /(^|\/)cli\/(index|main)\.[jt]s$/,
        /(^|\/)commands?\//,
        /\.command\.[jt]s$/,
      ],
    );

  const hasGeneratorStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)generators?\//,
        /(^|\/)scaffolds?\//,
        /(^|\/)scaffolding\//,
        /(^|\/)templates?\//,
        /(^|\/)blueprints?\//,
        /\.generator\.[jt]s$/,
        /\.scaffold\.[jt]s$/,
      ],
    );

  const hasPackageBinDeclaration =
    context.repositoryFiles.some((file) => {
      const normalizedPath =
        file.path
          .replace(/\\/g, "/")
          .toLowerCase();

      if (
        !normalizedPath.endsWith(
          "package.json",
        )
      ) {
        return false;
      }

      try {
        const manifest =
          JSON.parse(
            file.content,
          ) as {
            bin?: unknown;
          };

        return (
          typeof manifest.bin === "string" ||
          (
            typeof manifest.bin === "object" &&
            manifest.bin !== null &&
            !Array.isArray(
              manifest.bin,
            )
          )
        );
      } catch {
        return false;
      }
    });

  const hasGenerationCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const generationSignals = [
        "generate module",
        "generate resource",
        "generate controller",
        "generate service",
        "scaffold backend",
        "crud generator",
        "module generator",
        "project generator",
        "writefilesync",
        "copyfile",
        "template.render",
      ];

      return generationSignals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongDeveloperToolPurpose =
    [
      "backend scaffolding cli",
      "code generation cli",
      "developer command line tool",
      "project scaffolding tool",
      "application generator",
      "backend generator",
      "developer automation tool",
      "cli for developers",
      "code generator",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasCliDependency &&
    hasCliImport
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected CLI framework dependency used directly in source code",
      35,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasCliImport
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected direct command-line framework imports",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasCliDependency
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected command-line framework dependencies",
      20,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasGenerationDependency &&
    hasGenerationImport
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected code-generation dependency used directly in source code",
      35,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasGenerationImport ||
    hasGenerationDependency
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected scaffolding, templating, or code-generation tooling",
      25,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasCliEntrypoint &&
    hasPackageBinDeclaration
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected an executable package CLI with command entrypoints",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  } else if (
    hasCliEntrypoint
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected command-line entrypoints and command modules",
      30,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasGeneratorStructure &&
    hasGenerationCode
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected templates and implemented code-generation workflows",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  } else if (
    hasGeneratorStructure
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Detected scaffolding, generator, template, or blueprint structure",
      25,
      "FILE_STRUCTURE",
      "MEDIUM",
    );
  }

  if (
    hasStrongDeveloperToolPurpose &&
    (
      hasCliEntrypoint ||
      hasPackageBinDeclaration ||
      hasGeneratorStructure ||
      hasGenerationCode
    )
  ) {
    addEvidence(
      "DEVTOOL_PLATFORM",
      "Repository purpose explicitly describes a CLI, scaffolding, or code-generation product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};