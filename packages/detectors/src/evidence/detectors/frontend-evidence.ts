import type {
  EvidenceContext,
} from "../evidence-types";

const FRONTEND_FRAMEWORK_PACKAGES = [
  "react",
  "react-dom",
  "next",
  "vue",
  "nuxt",
  "@angular/core",
  "@angular/common",
  "svelte",
  "@sveltejs/kit",
  "solid-js",
  "preact",
];

const FRONTEND_UI_PACKAGES = [
  "tailwindcss",
  "@chakra-ui/react",
  "@mui/material",
  "antd",
  "shadcn",
  "radix-ui",
  "@radix-ui/react-dialog",
  "styled-components",
  "framer-motion",
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
 * Detects browser-facing frontend applications.
 *
 * Future me:
 * The existence of one component file, Tailwind dependency, React type,
 * or shared UI package does not automatically mean the repository's purpose
 * is a frontend application.
 *
 * We require a frontend runtime plus application structure or browser UI
 * implementation.
 */
export const detectFrontendEvidence = (
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

  const hasFrameworkDependency =
    hasAnySetValue(
      dependencies,
      FRONTEND_FRAMEWORK_PACKAGES,
    );

  const hasFrameworkImport =
    hasAnySetValue(
      imports,
      FRONTEND_FRAMEWORK_PACKAGES,
    );

  const hasUiDependency =
    hasAnySetValue(
      dependencies,
      FRONTEND_UI_PACKAGES,
    );

  const hasFrontendConfiguration =
    Array.from(
      configurationFiles,
    ).some((file) =>
      /next\.config|vite\.config|nuxt\.config|svelte\.config|angular\.json/i.test(
        file,
      ),
    );

  const hasFrontendApplicationStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)src\/app\//,
        /(^|\/)app\/.*page\.[jt]sx$/,
        /(^|\/)pages?\//,
        /(^|\/)views?\//,
        /(^|\/)screens?\//,
        /(^|\/)components?\//,
        /(^|\/)layouts?\//,
        /(^|\/)public\//,
        /(^|\/)assets?\//,
        /(^|\/)apps\/web\//,
        /(^|\/)apps\/frontend\//,
        /(^|\/)client\//,
      ],
    );

  const hasFrontendEntrypoint =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)src\/main\.[jt]sx$/,
        /(^|\/)src\/app\.[jt]sx$/,
        /(^|\/)src\/index\.[jt]sx$/,
        /(^|\/)pages\/_app\.[jt]sx$/,
        /(^|\/)app\/layout\.[jt]sx$/,
      ],
    );

  const frontendSourceFiles =
    filesChanged.filter((file) =>
      /\.(tsx|jsx|vue|svelte)$/.test(
        file.toLowerCase(),
      ),
    );

  const hasBrowserUiCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      return (
        content.includes(
          "reactdom.createroot",
        ) ||
        content.includes(
          "createapp(",
        ) ||
        content.includes(
          "use client",
        ) ||
        content.includes(
          "window.",
        ) ||
        content.includes(
          "document.",
        ) ||
        (
          content.includes(
            "return (",
          ) &&
          (
            content.includes("<div") ||
            content.includes("<main") ||
            content.includes("<section")
          )
        )
      );
    });

  const hasStrongFrontendPurpose =
    [
      "frontend application",
      "web application frontend",
      "client-side application",
      "user interface application",
      "dashboard frontend",
      "web dashboard",
      "customer-facing web application",
      "administrative dashboard",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasFrameworkDependency &&
    hasFrameworkImport
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected frontend framework dependency used directly in source code",
      40,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkImport
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected direct frontend framework imports",
      35,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasFrameworkDependency
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected frontend framework dependencies",
      25,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasFrontendConfiguration &&
    (
      hasFrontendApplicationStructure ||
      hasFrontendEntrypoint
    )
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected frontend framework configuration with application structure",
      35,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    frontendSourceFiles.length >= 5 &&
    (
      hasFrontendApplicationStructure ||
      hasBrowserUiCode
    )
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected substantial browser UI implementation",
      35,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasBrowserUiCode &&
    (
      hasFrameworkImport ||
      hasFrontendEntrypoint
    )
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected implemented browser-facing application code",
      30,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasUiDependency &&
    (
      hasFrameworkDependency ||
      hasFrameworkImport
    )
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Detected UI framework or component library supporting a frontend runtime",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasStrongFrontendPurpose &&
    (
      hasFrameworkDependency ||
      hasFrameworkImport ||
      hasFrontendApplicationStructure
    )
  ) {
    addEvidence(
      "FRONTEND_APPLICATION",
      "Repository purpose explicitly describes a browser-facing frontend application",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};