import type {
  EvidenceContext,
} from "../evidence-types";

import {
  includesAny,
} from "../evidence-utils";

/**
 * Detects repositories whose actual purpose is analysing software
 * repositories, engineering activity, architecture, or codebase health.
 *
 * Future me:
 * Individual concepts such as "GitHub", "repository", "architecture",
 * or "intelligence" are not enough.
 *
 * Engineering Intelligence requires evidence from BOTH:
 *
 * 1. an engineering-analysis capability
 * 2. a repository/codebase-analysis workflow
 *
 * This prevents ordinary developer tools and GitHub-integrated
 * applications from becoming Engineering Intelligence platforms.
 */
export const detectEngineeringIntelligenceEvidence = (
  context: EvidenceContext,
): void => {
  const {
    structuralText,
    descriptiveText,
    repositoryFiles,
    addEvidence,
  } = context;

  /**
   * Product capabilities that specifically describe analysing
   * engineering systems rather than simply building software.
   */
  const hasEngineeringAnalysisPurpose =
    includesAny(
      descriptiveText,
      [
        "engineering intelligence",
        "codebase intelligence",
        "repository intelligence",
        "architecture intelligence",
        "repository fingerprint",
        "technology fingerprint",
        "architecture drift",
        "architecture evolution",
        "engineering quality",
        "repository health",
        "repository maturity",
        "technical debt",
        "repository benchmark",
        "engineering scorecard",
      ],
    );

  /**
   * Structural evidence that the repository actually contains
   * engineering-intelligence implementation areas.
   */
  const hasEngineeringAnalysisStructure =
    includesAny(
      structuralText,
      [
        "repository-intelligence",
        "technology-fingerprint",
        "architecture-drift",
        "repository-evolution",
        "repository-health",
        "repository-maturity",
        "engineering-quality",
        "technical-debt",
        "architecture-quality",
      ],
    );

  /**
   * Engineering Intelligence also needs a repository-analysis workflow.
   *
   * Otherwise an application that merely discusses architecture in its
   * README could accidentally satisfy the detector.
   */
  const hasRepositoryAnalysisPurpose =
    includesAny(
      descriptiveText,
      [
        "github repository analysis",
        "repository analysis",
        "codebase analysis",
        "commit analysis",
        "pull request analysis",
        "repository import",
        "engineering event",
        "architecture change",
        "repository timeline",
      ],
    );

  const hasRepositoryAnalysisStructure =
    includesAny(
      structuralText,
      [
        "github",
        "repository",
        "engineering-event",
        "architecture-change",
        "timeline",
        "webhook",
      ],
    );

  /**
   * Actual source code gives us another strong implementation signal.
   *
   * We deliberately require several related concepts inside the same
   * repository instead of trusting one isolated keyword.
   */
  const hasEngineeringIntelligenceCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "repository intelligence",
        "technology fingerprint",
        "repository health",
        "repository maturity",
        "architecture drift",
        "engineering quality",
        "architecture change",
        "engineering event",
      ];

      const matches =
        signals.filter((signal) =>
          content.includes(signal),
        );

      return matches.length >= 3;
    });

  /**
   * Highest-quality case:
   *
   * The repository says what the product does AND contains the
   * corresponding implementation structure.
   */
  if (
    hasEngineeringAnalysisPurpose &&
    hasEngineeringAnalysisStructure &&
    (
      hasRepositoryAnalysisPurpose ||
      hasRepositoryAnalysisStructure
    )
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected implemented engineering intelligence and repository analysis platform",
      95,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );

    return;
  }

  /**
   * Source-code implementation can independently provide strong
   * corroboration when repository structure also supports the purpose.
   */
  if (
    hasEngineeringIntelligenceCode &&
    hasEngineeringAnalysisStructure &&
    hasRepositoryAnalysisStructure
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Detected engineering intelligence implementation across repository analysis source code",
      90,
      "CODE_PATTERN",
      "STRONG",
    );

    return;
  }

  /**
   * Descriptive purpose alone is useful evidence, but deliberately not
   * enough to classify the entire repository.
   */
  if (
    hasEngineeringAnalysisPurpose &&
    hasRepositoryAnalysisPurpose
  ) {
    addEvidence(
      "ENGINEERING_INTELLIGENCE_PLATFORM",
      "Repository describes engineering intelligence and repository analysis capabilities",
      40,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};