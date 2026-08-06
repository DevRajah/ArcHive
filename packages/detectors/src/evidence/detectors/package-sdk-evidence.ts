import type {
  EvidenceContext,
} from "../evidence-types";

const SDK_PACKAGES = [
  "tsup",
  "rollup",
  "unbuild",
  "microbundle",
  "vite",
  "typedoc",
  "api-extractor",
  "@microsoft/api-extractor",
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
    const normalizedPath =
      file
        .replace(/\\/g, "/")
        .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects reusable packages, SDKs, client libraries, and published modules.
 *
 * Future me:
 * The words SDK, library, client, package, or plugin are not enough.
 * A PACKAGE_LIBRARY should expose a reusable public API, package entrypoints,
 * build configuration, exports, typings, or publication metadata.
 */
export const detectPackageSdkEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    configurationFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasPackageBuildDependency =
    hasAnySetValue(
      dependencies,
      SDK_PACKAGES,
    );

  const hasPackageBuildImport =
    hasAnySetValue(
      imports,
      SDK_PACKAGES,
    );

  const hasLibraryStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)packages\/[^/]+\/src\//,
        /(^|\/)libs?\/[^/]+\/src\//,
        /(^|\/)sdk\//,
        /(^|\/)client\//,
        /(^|\/)clients?\//,
        /(^|\/)src\/index\.[jt]s$/,
        /(^|\/)src\/public-api\.[jt]s$/,
        /(^|\/)src\/exports\.[jt]s$/,
      ],
    );

  const hasPackageConfiguration =
    Array.from(
      configurationFiles,
    ).some((file) =>
      /tsup\.config|rollup\.config|unbuild|microbundle|typedoc|api-extractor/i.test(
        file,
      ),
    ) ||
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)tsup\.config\.[jt]s$/,
        /(^|\/)rollup\.config\.[jt]s$/,
        /(^|\/)typedoc\.json$/,
        /(^|\/)api-extractor\.json$/,
      ],
    );

  const packageManifests =
    repositoryFiles.filter((file) =>
      file.path
        .replace(/\\/g, "/")
        .toLowerCase()
        .endsWith("package.json"),
    );

  let hasPublishablePackageManifest =
    false;

  let hasPublicExports =
    false;

  let hasTypeDeclarations =
    false;

  let hasPackageEntrypoint =
    false;

  for (const file of packageManifests) {
    try {
      const manifest =
        JSON.parse(
          file.content,
        ) as {
          private?: unknown;
          main?: unknown;
          module?: unknown;
          types?: unknown;
          typings?: unknown;
          exports?: unknown;
          files?: unknown;
          publishConfig?: unknown;
        };

      const isPrivate =
        manifest.private === true;

      const hasEntryField =
        typeof manifest.main === "string" ||
        typeof manifest.module === "string" ||
        typeof manifest.types === "string" ||
        typeof manifest.typings === "string";

      const hasExportsField =
        typeof manifest.exports === "string" ||
        (
          typeof manifest.exports === "object" &&
          manifest.exports !== null
        );

      const hasPublicationField =
        Array.isArray(
          manifest.files,
        ) ||
        (
          typeof manifest.publishConfig === "object" &&
          manifest.publishConfig !== null
        );

      if (
        !isPrivate &&
        (
          hasEntryField ||
          hasExportsField ||
          hasPublicationField
        )
      ) {
        hasPublishablePackageManifest =
          true;
      }

      if (hasExportsField) {
        hasPublicExports =
          true;
      }

      if (
        typeof manifest.types === "string" ||
        typeof manifest.typings === "string"
      ) {
        hasTypeDeclarations =
          true;
      }

      if (hasEntryField) {
        hasPackageEntrypoint =
          true;
      }
    } catch {
      /**
       * One malformed package manifest must not stop analysis.
       */
    }
  }

  const hasSdkSourceCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "export class",
        "export interface",
        "export type",
        "public api",
        "client options",
        "sdk configuration",
        "api client",
        "createclient",
        "client constructor",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongPackagePurpose =
    [
      "npm package",
      "typescript sdk",
      "javascript sdk",
      "client library",
      "api client library",
      "reusable package",
      "open-source library",
      "developer sdk",
      "published package",
      "package library",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasPackageBuildDependency &&
    hasPackageBuildImport
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Detected package-build tooling used directly in source code",
      20,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasPackageBuildDependency
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Detected package or library build tooling",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasPublishablePackageManifest &&
    (
      hasPublicExports ||
      hasPackageEntrypoint
    )
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Detected a publishable package manifest with public exports or package entrypoints",
      45,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    hasLibraryStructure &&
    (
      hasPackageConfiguration ||
      hasPublishablePackageManifest
    )
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Detected reusable SDK or library structure with package build configuration",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasSdkSourceCode &&
    (
      hasPublicExports ||
      hasTypeDeclarations ||
      hasLibraryStructure
    )
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Detected implemented reusable SDK, client-library, or public API exports",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPackagePurpose &&
    (
      hasPublishablePackageManifest ||
      hasLibraryStructure ||
      hasSdkSourceCode
    )
  ) {
    addEvidence(
      "PACKAGE_LIBRARY",
      "Repository purpose explicitly describes a reusable package, SDK, or client library",
      25,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};