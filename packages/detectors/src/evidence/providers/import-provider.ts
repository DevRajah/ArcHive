import type {
  EvidenceContext,
} from "../evidence-types";

const SOURCE_FILE_PATTERN =
  /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const IMPORT_PATTERNS = [
  /**
   * import value from "package"
   * import "package"
   * export value from "package"
   */
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,

  /**
   * const value = require("package")
   */
  /require\(\s*["']([^"']+)["']\s*\)/g,

  /**
   * const value = await import("package")
   */
  /import\(\s*["']([^"']+)["']\s*\)/g,
];

const normalizePackageName = (
  importedValue: string,
): string | null => {
  const value =
    importedValue.trim();

  /**
   * Ignore local modules and Node.js built-ins.
   */
  if (
    !value ||
    value.startsWith(".") ||
    value.startsWith("/") ||
    value.startsWith("node:")
  ) {
    return null;
  }

  /**
   * Preserve the package root for scoped dependencies.
   *
   * @prisma/client/runtime becomes @prisma/client.
   */
  if (
    value.startsWith("@")
  ) {
    const [
      scope,
      packageName,
    ] = value.split("/");

    if (
      !scope ||
      !packageName
    ) {
      return value.toLowerCase();
    }

    return `${scope}/${packageName}`
      .toLowerCase();
  }

  /**
   * socket.io/client becomes socket.io.
   */
  return (
    value
      .split("/")[0]
      ?.toLowerCase() ??
    null
  );
};

/**
 * Extracts third-party package imports from JavaScript and TypeScript files.
 */
export const collectImportEvidence = (
  context: EvidenceContext,
): void => {
  for (
    const file of
    context.repositoryFiles
  ) {
    if (
      !SOURCE_FILE_PATTERN.test(
        file.path,
      )
    ) {
      continue;
    }

    context.importFiles.add(
      file.path,
    );

    for (
      const pattern of
      IMPORT_PATTERNS
    ) {
      pattern.lastIndex = 0;

      for (
        const match of
        file.content.matchAll(
          pattern,
        )
      ) {
        const packageName =
          normalizePackageName(
            match[1],
          );

        if (!packageName) {
          continue;
        }

        context.imports.add(
          packageName,
        );
      }
    }
  }
};