import type {
  EvidenceContext,
} from "../evidence-types";

const DESIGN_SYSTEM_PACKAGES = [
  "@storybook/react",
  "@storybook/nextjs",
  "@storybook/vue3",
  "@storybook/addon-essentials",
  "@radix-ui/react-dialog",
  "@radix-ui/react-slot",
  "@chakra-ui/react",
  "@mui/material",
  "styled-components",
  "class-variance-authority",
  "tailwind-variants",
  "style-dictionary",
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
 * Detects repositories whose primary purpose is maintaining reusable UI
 * components, design tokens, themes, and documented interface standards.
 *
 * Future me:
 * A normal frontend application may use Storybook, themes, Tailwind,
 * component folders, or a UI library. Those signals alone do not prove
 * that the repository itself is a design system.
 */
export const detectDesignSystemEvidence = (
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

  const hasDesignSystemDependency =
    hasAnySetValue(
      dependencies,
      DESIGN_SYSTEM_PACKAGES,
    );

  const hasDesignSystemImport =
    hasAnySetValue(
      imports,
      DESIGN_SYSTEM_PACKAGES,
    );

  const hasStorybookConfiguration =
    filesChanged.some((file) =>
      /(^|\/)\.storybook\//i.test(
        file,
      ),
    ) ||
    Array.from(
      configurationFiles,
    ).some((file) =>
      /storybook/i.test(file),
    );

  const hasComponentLibraryStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)packages\/ui\//,
        /(^|\/)packages\/components?\//,
        /(^|\/)component-library\//,
        /(^|\/)design-system\//,
        /(^|\/)ui-kit\//,
        /(^|\/)primitives?\//,
        /(^|\/)foundations?\//,
      ],
    );

  const hasTokenStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)tokens?\//,
        /(^|\/)design-tokens?\//,
        /(^|\/)themes?\//,
        /(^|\/)typography\//,
        /(^|\/)colours?\//,
        /(^|\/)colors?\//,
        /(^|\/)spacing\//,
        /(^|\/)foundations?\//,
        /\.tokens?\.(json|ts|js)$/,
      ],
    );

  const storyFiles =
    filesChanged.filter((file) =>
      /\.(stories|story)\.(ts|tsx|js|jsx|mdx)$/i.test(
        file,
      ),
    );

  const reusableComponentFiles =
    filesChanged.filter((file) =>
      /(^|\/)(components?|primitives?)\/.*\.(tsx|jsx|vue|svelte)$/i.test(
        file,
      ),
    );

  const hasDesignSystemCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "design token",
        "theme provider",
        "component variant",
        "component primitive",
        "typography scale",
        "spacing scale",
        "colour palette",
        "color palette",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasStrongPurposeLanguage =
    [
      "design system",
      "component library",
      "ui component library",
      "reusable ui library",
      "design token system",
      "interface design system",
      "shared component system",
      "ui kit",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasDesignSystemDependency &&
    hasDesignSystemImport
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Detected design-system dependency used directly in source code",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasDesignSystemDependency
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Detected design-system or component-library dependencies",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasStorybookConfiguration &&
    storyFiles.length >= 5
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Detected substantial Storybook documentation for reusable components",
      35,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    hasComponentLibraryStructure &&
    (
      hasTokenStructure ||
      reusableComponentFiles.length >= 8
    )
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Detected reusable component-library structure with design foundations or substantial component coverage",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasDesignSystemCode &&
    (
      hasComponentLibraryStructure ||
      hasTokenStructure
    )
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Detected implemented design tokens, themes, variants, or component primitives",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongPurposeLanguage &&
    (
      hasStorybookConfiguration ||
      hasComponentLibraryStructure ||
      hasTokenStructure
    )
  ) {
    addEvidence(
      "DESIGN_SYSTEM",
      "Repository purpose explicitly describes a reusable design system or component library",
      25,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};