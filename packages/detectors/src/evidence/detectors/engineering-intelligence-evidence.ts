import type {
  EvidenceContext,
} from "../evidence-types";

const ENGINEERING_INTELLIGENCE_PACKAGES = [
  "@octokit/rest",
  "octokit",
  "probot",
  "@octokit/webhooks",
  "@octokit/oauth-app",
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
 * Detects products that analyse software repositories, engineering activity,
 * architecture evolution, repository health, and engineering quality.
 *
 * Future me:
 * Generic words such as "repository", "architecture", "metrics", "health",
 * or "intelligence" must never confirm this repository purpose by themselves.
 *
 * A genuine engineering-intelligence platform should combine:
 *
 * - repository ingestion or GitHub integration
 * - engineering or architecture analysis
 * - generated intelligence, scoring, timelines, or reports
 */
export const detectEngineeringIntelligenceEvidence = (
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

  const hasGitHubDependency =
    hasAnySetValue(
      dependencies,
      ENGINEERING_INTELLIGENCE_PACKAGES,
    );

  const hasGitHubImport =
    hasAnySetValue(
      imports,
      ENGINEERING_INTELLIGENCE_PACKAGES,
    );

  const hasRepositoryIngestionStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)github\//,
        /(^|\/)webhooks?\//,
        /(^|\/)repository-import\//,
        /(^|\/)repositories\/.*import/,
        /github[-_.]?oauth/,
        /github[-_.]?webhook/,
        /repository[-_.]?import/,
        /pull[-_.]?request[-_.]?analysis/,
        /commit[-_.]?analysis/,
      ],
    );

  const hasIntelligenceStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)repository-intelligence\//,
        /(^|\/)engineering-intelligence\//,
        /(^|\/)architecture-intelligence\//,
        /(^|\/)repository-health\//,
        /(^|\/)repository-evolution\//,
        /(^|\/)architecture-drift\//,
        /(^|\/)technology-fingerprint\//,
        /(^|\/)fingerprint\//,
        /repository[-_.]?intelligence/,
        /technology[-_.]?fingerprint/,
        /architecture[-_.]?drift/,
        /repository[-_.]?health/,
        /repository[-_.]?maturity/,
        /engineering[-_.]?quality/,
      ],
    );

  const hasTimelineOrSnapshotStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)timeline\//,
        /(^|\/)snapshots?\//,
        /(^|\/)architecture-changes?\//,
        /(^|\/)engineering-events?\//,
        /(^|\/)reports?\//,
        /intelligence[-_.]?snapshot/,
        /architecture[-_.]?change/,
        /engineering[-_.]?event/,
      ],
    );

  const hasRepositoryAnalysisCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "repository intelligence",
        "technology fingerprint",
        "architecture drift",
        "repository maturity",
        "repository health",
        "engineering quality",
        "architecture change",
        "engineering event",
        "repository timeline",
        "repository comparison",
        "repository benchmark",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasGitHubAnalysisCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "github webhook",
        "github oauth",
        "repository import",
        "pull request",
        "commit analysis",
        "repository tree",
        "githubaccesstoken",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongPurposeLanguage =
    [
      "engineering intelligence platform",
      "repository intelligence platform",
      "codebase intelligence platform",
      "software engineering intelligence",
      "repository analysis platform",
      "architecture intelligence platform",
      "engineering health platform",
      "architecture evolution platform",
      "engineering analytics platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  const hasGitHubIntegration =
    hasGitHubImport ||
    hasRepositoryIngestionStructure ||
    hasGitHubAnalysisCode;

  const hasEngineeringAnalysis =
    hasIntelligenceStructure ||
    hasRepositoryAnalysisCode;

  if (
    hasGitHubDependency &&
    hasGitHubImport
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected GitHub integration dependency used directly in source code",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasGitHubImport
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected direct GitHub integration imports",
      20,
      "IMPORT",
      "STRONG",
    );
  }

  if (
    hasRepositoryIngestionStructure &&
    hasIntelligenceStructure
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected repository ingestion together with engineering or architecture intelligence modules",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasEngineeringAnalysis &&
    hasTimelineOrSnapshotStructure
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected repository analysis with historical snapshots, engineering events, timelines, or architecture changes",
      35,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasRepositoryAnalysisCode &&
    hasGitHubIntegration
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected implemented repository analysis and GitHub ingestion workflows",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPurposeLanguage &&
    hasGitHubIntegration &&
    hasEngineeringAnalysis
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Repository purpose explicitly describes an engineering or repository intelligence platform",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};