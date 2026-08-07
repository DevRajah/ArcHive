/**
 * Checks whether a block of text contains at least one supplied keyword.
 *
 * Future me:
 * Keep this helper for capability and legacy descriptive checks.
 * Repository-purpose detectors should prefer structured evidence whenever
 * possible instead of treating this helper as proof of implementation.
 */
export const includesAny = (
  value: string,
  keywords: string[],
): boolean => {
  const normalizedValue =
    value.toLowerCase();

  return keywords.some((keyword) =>
    normalizedValue.includes(
      keyword.toLowerCase(),
    ),
  );
};

/**
 * Normalises repository paths before structural evidence checks.
 *
 * GitHub normally returns forward slashes, but detectors should remain
 * independent of operating-system path formatting and casing.
 */
const normalizeRepositoryPath = (
  value: string,
): string => {
  return value
    .replace(/\\/g, "/")
    .replace(/^\/+/, "")
    .toLowerCase();
};

/**
 * Checks whether any repository path contains one of the supplied fragments.
 *
 * Example:
 *
 * src/controllers/ledger.controller.ts
 *
 * can match:
 *
 * ledger
 * controllers/ledger
 * ledger.controller
 */
export const fileMatchesAny = (
  files: string[],
  patterns: string[],
): boolean => {
  const normalizedPatterns =
    patterns.map(
      normalizeRepositoryPath,
    );

  return files.some((file) => {
    const normalizedFile =
      normalizeRepositoryPath(
        file,
      );

    return normalizedPatterns.some(
      (pattern) =>
        normalizedFile.includes(
          pattern,
        ),
    );
  });
};

/**
 * Checks for exact repository-relative paths.
 */
export const fileEqualsAny = (
  files: string[],
  patterns: string[],
): boolean => {
  const normalizedPatterns =
    patterns.map(
      normalizeRepositoryPath,
    );

  return files.some((file) => {
    const normalizedFile =
      normalizeRepositoryPath(
        file,
      );

    return normalizedPatterns.includes(
      normalizedFile,
    );
  });
};

/**
 * Checks whether any repository path ends with one of the supplied values.
 *
 * Useful for extensions and well-known filenames.
 */
export const fileEndsWithAny = (
  files: string[],
  endings: string[],
): boolean => {
  const normalizedEndings =
    endings.map(
      normalizeRepositoryPath,
    );

  return files.some((file) => {
    const normalizedFile =
      normalizeRepositoryPath(
        file,
      );

    return normalizedEndings.some(
      (ending) =>
        normalizedFile.endsWith(
          ending,
        ),
    );
  });
};