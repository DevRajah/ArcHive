import type {
  EvidenceContext,
} from "../evidence-types";

const AI_PACKAGES = [
  "tensorflow",
  "@tensorflow/tfjs",
  "torch",
  "pytorch",
  "scikit-learn",
  "transformers",
  "@huggingface/inference",
  "langchain",
  "@langchain/core",
  "llamaindex",
  "openai",
  "@anthropic-ai/sdk",
  "@modelcontextprotocol/sdk",
  "ollama",
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
    const normalized =
      file.replace(/\\/g, "/").toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalized),
    );
  });
};

/**
 * Classifies genuine AI and machine-learning repositories.
 *
 * AI SDK usage by itself is not enough. Many normal applications call an
 * AI API without being AI/ML projects. We require multiple independent
 * signals before this repository purpose can reach its threshold.
 */
export const detectAiEvidence = (
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

  const hasAiDependency =
    hasAnySetValue(
      dependencies,
      AI_PACKAGES,
    );

  const hasAiImport =
    hasAnySetValue(
      imports,
      AI_PACKAGES,
    );

  const hasModelImplementation =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)models?\//,
        /(^|\/)embeddings?\//,
        /(^|\/)inference\//,
        /(^|\/)training\//,
        /(^|\/)rag\//,
        /(^|\/)agents?\//,
        /\.model\.(py|ts|js)$/,
        /\.embedding\.(py|ts|js)$/,
        /\.inference\.(py|ts|js)$/,
      ],
    );

  const hasNotebookWorkflow =
    filesChanged.some((file) =>
      file.toLowerCase().endsWith(".ipynb"),
    );

  const hasAiSourceUsage =
    repositoryFiles.some((file) => {
      const normalizedContent =
        file.content.toLowerCase();

      return (
        normalizedContent.includes(
          "model.generate",
        ) ||
        normalizedContent.includes(
          "embeddings.create",
        ) ||
        normalizedContent.includes(
          "vectorstore",
        ) ||
        normalizedContent.includes(
          "retrievalaugmented",
        ) ||
        normalizedContent.includes(
          "retrieval augmented",
        ) ||
        normalizedContent.includes(
          "model.fit(",
        ) ||
        normalizedContent.includes(
          "model.predict(",
        )
      );
    });

  const hasStrongAiPurposeLanguage =
    [
      "machine learning model",
      "model training",
      "inference pipeline",
      "embedding pipeline",
      "retrieval augmented generation",
      "rag pipeline",
      "ai agent platform",
      "computer vision",
      "natural language processing",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasAiDependency &&
    hasAiImport
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected AI or machine-learning dependency used directly in source code",
      45,
      "IMPORT",
      "STRONG",
    );
  } else if (hasAiImport) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected direct AI or machine-learning framework imports",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (hasAiDependency) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected AI or machine-learning framework dependencies",
      30,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasModelImplementation ||
    hasAiSourceUsage
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected model, inference, embedding, RAG, or agent implementation structure",
      30,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasNotebookWorkflow &&
    (
      hasAiDependency ||
      hasAiImport
    )
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected notebooks alongside AI or machine-learning dependencies",
      20,
      "FILE_STRUCTURE",
      "MEDIUM",
    );
  }

  if (
    hasStrongAiPurposeLanguage &&
    (
      hasAiDependency ||
      hasAiImport ||
      hasModelImplementation
    )
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Repository purpose explicitly describes model training, inference, RAG, or AI agent workflows",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};