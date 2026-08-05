import type {
  RepositoryType,
} from "../constants";

export type EvidenceCategory =
  | "REPOSITORY_METADATA"
  | "FILE_STRUCTURE"
  | "DEPENDENCY"
  | "CODE_PATTERN"
  | "DOMAIN_LANGUAGE"
  | "ARCHITECTURE_PATTERN"
  | "README"
  | "COMMIT"
  | "CONFIGURATION"
  | "IMPORT"
  | "LOCK_FILE";

export type EvidenceStrength =
  | "WEAK"
  | "MEDIUM"
  | "STRONG";

/**
 * Describes where a technology signal originated.
 *
 * ArcHive can use this later to distinguish real implementation
 * evidence from documentation-only mentions.
 */
export type TechnologyEvidenceSource =
  | "PACKAGE_JSON"
  | "DEPENDENCY"
  | "IMPORT"
  | "CONFIGURATION"
  | "FILE_PATH"
  | "SOURCE_CODE"
  | "LOCK_FILE"
  | "README"
  | "COMMIT_MESSAGE"
  | "REPOSITORY_CONTEXT"
  | "UNKNOWN";

export type TechnologyEvidenceStatus =
  | "CONFIRMED"
  | "LIKELY"
  | "MENTIONED";

export type EvidenceItem = {
  repositoryType: RepositoryType;
  label: string;
  weight: number;
  category: EvidenceCategory;
  strength: EvidenceStrength;
};

export type EvidenceResult = {
  repositoryType: RepositoryType;
  confidence: number;
  evidence: string[];
  strongestEvidence: string[];
  totalScore: number;
};

export type TechnologyEvidence = {
  name: string;
  reason: string;
  weight: number;
  strength: EvidenceStrength;

  /**
   * The original location of the signal.
   */
  source: TechnologyEvidenceSource;

  /**
   * Human-readable evidence, such as a dependency, file path,
   * configuration file, or README mention.
   */
  evidence: string;

  /**
   * Classification derived from evidence quality.
   */
  status: TechnologyEvidenceStatus;
};

export type EvidenceContextInput = {
  filesChanged: string[];
  commitMessages: string[];
  repositoryContext?: string;
};

/**
 * The overload keeps older technology detectors compiling while we
 * migrate them from positional arguments to structured evidence.
 */
export type AddTechnology = {
  (
    technology: TechnologyEvidence,
  ): void;

  (
    name: string,
    reason: string,
    weight: number,
    strength: EvidenceStrength,
  ): void;
};

export type EvidenceContext = {
  filesChanged: string[];
  commitMessages: string[];
    /**
   * Dependency manifests discovered in the repository.
   *
   * Examples:
   * package.json
   * pnpm-lock.yaml
   * requirements.txt
   */
  dependencyFiles: Set<string>;

  /**
 * Dependencies extracted from package managers.
 *
 * Example:
 * fastify
 * bullmq
 * socket.io
 */
dependencies: Set<string>;

  /**
   * Source files that can later be scanned for imports.
   */
  importFiles: Set<string>;

  /**
 * Packages imported by source code.
 */
imports: Set<string>;

  /**
   * Framework and infrastructure configuration files.
   */
  configurationFiles: Set<string>;

  /**
   * Programming languages inferred from file extensions.
   */
  languages: Set<string>;

  /**
   * Kept temporarily for old detectors.
   *
   * New detectors should avoid relying on this field because it merges
   * strong and weak evidence into one unstructured string.
   */
  combinedText: string;

  /**
   * Strong structural evidence originating from repository file paths.
   */
  filePathText: string;

  /**
   * Commit messages are useful context, but cannot confirm a technology
   * on their own.
   */
  commitText: string;

  /**
   * README, description and other descriptive repository context.
   *
   * Treat this as weak evidence.
   */
  repositoryContextText: string;

  /**
   * Evidence safe to use for structural checks.
   */
  structuralText: string;

  /**
   * Evidence that can support a detection but should not independently
   * confirm implementation.
   */
  descriptiveText: string;

  evidenceItems: EvidenceItem[];

  technologyEvidence:
    TechnologyEvidence[];

  addEvidence: (
    repositoryType: RepositoryType,
    label: string,
    weight: number,
    category: EvidenceCategory,
    strength: EvidenceStrength,
  ) => void;

  addTechnology: AddTechnology;
};