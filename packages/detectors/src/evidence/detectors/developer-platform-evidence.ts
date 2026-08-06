import type {
  EvidenceContext,
} from "../evidence-types";

const PLATFORM_PACKAGES = [
  "@backstage/core-app-api",
  "@backstage/backend-defaults",
  "@backstage/catalog-model",
  "@pulumi/pulumi",
  "probot",
  "octokit",
  "@octokit/rest",
  "@kubernetes/client-node",
  "dockerode",
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
 * Detects platforms that provide shared infrastructure and workflows
 * for software developers or engineering teams.
 *
 * Future me:
 * A repository is not a developer platform merely because it contains
 * plugins, SDKs, workers, or the word "platform".
 *
 * A genuine developer platform should expose multiple developer-facing
 * capabilities such as service catalogues, templates, environments,
 * deployments, integrations, provisioning, or internal tooling.
 */
export const detectDeveloperPlatformEvidence = (
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

  const hasPlatformDependency =
    hasAnySetValue(
      dependencies,
      PLATFORM_PACKAGES,
    );

  const hasPlatformImport =
    hasAnySetValue(
      imports,
      PLATFORM_PACKAGES,
    );

  const hasServiceCatalogue =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)service-catalog\//,
        /(^|\/)catalog\//,
        /(^|\/)software-catalog\//,
        /\.catalog\.[jt]s$/,
      ],
    );

  const hasTemplateOrScaffolder =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)templates?\//,
        /(^|\/)scaffolder\//,
        /(^|\/)project-templates?\//,
        /(^|\/)service-templates?\//,
      ],
    );

  const hasEnvironmentManagement =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)environments?\//,
        /(^|\/)deployments?\//,
        /(^|\/)provisioning\//,
        /(^|\/)infrastructure\//,
        /(^|\/)runtime\//,
      ],
    );

  const hasDeveloperPortalStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)developer-portal\//,
        /(^|\/)portal\/.*developer/,
        /(^|\/)platform-api\//,
        /(^|\/)platform\/catalog\//,
        /(^|\/)platform\/templates?\//,
      ],
    );

  const hasPluginEcosystem =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)plugins?\//,
        /(^|\/)integrations?\//,
        /(^|\/)connectors?\//,
      ],
    );

  const platformCapabilityCount = [
    hasServiceCatalogue,
    hasTemplateOrScaffolder,
    hasEnvironmentManagement,
    hasDeveloperPortalStructure,
    hasPluginEcosystem,
  ].filter(Boolean).length;

  const hasPlatformSourceUsage =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "service catalog",
        "software catalog",
        "developer portal",
        "environment provisioning",
        "service template",
        "deployment environment",
        "platform integration",
        "internal developer platform",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongPlatformPurpose =
    [
      "internal developer platform",
      "developer platform",
      "developer portal",
      "platform engineering",
      "developer infrastructure platform",
      "application delivery platform",
      "self-service developer platform",
      "engineering enablement platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasPlatformDependency &&
    hasPlatformImport
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected developer-platform dependency used directly in source code",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasPlatformImport
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected direct developer-platform framework or infrastructure imports",
      35,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasPlatformDependency
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected developer-platform framework or infrastructure dependencies",
      25,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    platformCapabilityCount >= 3
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected multiple developer-platform capabilities including catalogues, templates, environments, portals, or integrations",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasDeveloperPortalStructure &&
    (
      hasServiceCatalogue ||
      hasTemplateOrScaffolder ||
      hasEnvironmentManagement
    )
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected developer portal structure with platform management capabilities",
      35,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (hasPlatformSourceUsage) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Detected implemented service-catalogue, developer-portal, or environment-provisioning concepts",
      30,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPlatformPurpose &&
    (
      platformCapabilityCount >= 2 ||
      hasPlatformSourceUsage ||
      hasPlatformImport
    )
  ) {
    addEvidence(
      "DEVELOPER_PLATFORM",
      "Repository purpose explicitly describes a developer platform or platform-engineering product",
      25,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};