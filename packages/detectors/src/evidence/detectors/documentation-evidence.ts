import type {
  EvidenceContext,
} from "../evidence-types";

const DOCUMENTATION_PACKAGES = [
  "docusaurus",
  "@docusaurus/core",
  "vitepress",
  "vuepress",
  "mkdocs",
  "docsify",
  "nextra",
  "gatsby",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

/**
 * A README and several Markdown files do not make a repository a
 * documentation product. Documentation must be the repository's dominant
 * structure or use a dedicated documentation framework.
 */
export const detectDocumentationEvidence = (
  context: EvidenceContext,
): void => {
  const {
    filesChanged,
    dependencies,
    imports,
    configurationFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const normalizedFiles =
    filesChanged.map((file) =>
      file.replace(/\\/g, "/").toLowerCase(),
    );

  const documentationFiles =
    normalizedFiles.filter((file) =>
      (
        file.startsWith("docs/") ||
        file.includes("/docs/") ||
        file.startsWith("documentation/") ||
        file.includes("/documentation/")
      ) &&
      (
        file.endsWith(".md") ||
        file.endsWith(".mdx")
      ),
    );

  const sourceFiles =
    normalizedFiles.filter((file) =>
      /\.(ts|tsx|js|jsx|py|go|java|rs|php|cs)$/.test(
        file,
      ),
    );

  const hasDocumentationFramework =
    hasAnySetValue(
      dependencies,
      DOCUMENTATION_PACKAGES,
    ) ||
    hasAnySetValue(
      imports,
      DOCUMENTATION_PACKAGES,
    ) ||
    Array.from(
      configurationFiles,
    ).some((file) =>
      /docusaurus\.config|vitepress|vuepress|mkdocs\.ya?ml|docsify|nextra/i.test(
        file,
      ),
    );

  const documentationDominates =
    documentationFiles.length >= 8 &&
    (
      sourceFiles.length === 0 ||
      documentationFiles.length >=
        sourceFiles.length
    );

  const hasDocumentationPurpose =
    [
      "documentation website",
      "developer documentation",
      "technical documentation portal",
      "knowledge base",
      "documentation repository",
      "api documentation site",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasDocumentationFramework
  ) {
    addEvidence(
      "DOCUMENTATION_HEAVY_REPOSITORY",
      "Detected a dedicated documentation-site framework or configuration",
      45,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    documentationDominates
  ) {
    addEvidence(
      "DOCUMENTATION_HEAVY_REPOSITORY",
      "Documentation files dominate the repository structure",
      30,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasDocumentationPurpose &&
    (
      hasDocumentationFramework ||
      documentationDominates
    )
  ) {
    addEvidence(
      "DOCUMENTATION_HEAVY_REPOSITORY",
      "Repository purpose explicitly describes a documentation portal or knowledge base",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};