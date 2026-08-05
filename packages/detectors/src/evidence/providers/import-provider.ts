import type {
  EvidenceContext,
} from "../evidence-types";

const SOURCE_FILE_PATTERN =
  /\.(ts|tsx|js|jsx|mjs|cjs)$/i;

const IMPORT_PATTERNS = [
  /(?:import|export)\s+(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']/g,
  /require\(\s*["']([^"']+)["']\s*\)/g,
  /import\(\s*["']([^"']+)["']\s*\)/g,
];

const normalizePackageName = (
  importedValue: string,
): string | null => {
  const value =
    importedValue.trim();

  if (
    !value ||
    value.startsWith(".") ||
    value.startsWith("/") ||
    value.startsWith("node:")
  ) {
    return null;
  }

  if (value.startsWith("@")) {
    const [scope, packageName] =
      value.split("/");

    return packageName
      ? `${scope}/${packageName}`.toLowerCase()
      : value.toLowerCase();
  }

  return (
    value.split("/")[0]
      ?.toLowerCase() ?? null
  );
};

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

        if (packageName) {
          context.imports.add(
            packageName,
          );
        }
      }
    }
  }
};