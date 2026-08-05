import type {
  EvidenceContext,
  TechnologyEvidenceSource,
} from "../evidence";

/**
 * These paths describe ArcHive's detection rules rather than technologies
 * implemented by the repository being analysed.
 *
 * This prevents ArcHive from detecting Kafka simply because kafka-detector.ts
 * exists inside ArcHive's own codebase.
 */
const ignoredEvidencePaths = [
  "packages/detectors/src/technologies/",
  "packages/detectors/src/evidence/",
  "node_modules/",
  "dist/",
  "build/",
  "coverage/",
  ".next/",
];

const normalisePath = (
  filePath: string,
): string => {
  return filePath
    .replace(/\\/g, "/")
    .toLowerCase();
};

export const isIgnoredEvidenceFile = (
  filePath: string,
): boolean => {
  const normalised =
    normalisePath(filePath);

  return ignoredEvidencePaths.some(
    (ignoredPath) =>
      normalised.includes(
        ignoredPath,
      ),
  );
};

/**
 * Returns repository files that may provide genuine implementation evidence.
 */
export const getImplementationFiles = (
  context: EvidenceContext,
): string[] => {
  return context.filesChanged
    .map(normalisePath)
    .filter(
      (filePath) =>
        !isIgnoredEvidenceFile(
          filePath,
        ),
    );
};

/**
 * Finds a real repository file matching one of the supplied signals.
 *
 * New technology detectors should use this instead of hasKeyword().
 */
export const findImplementationFile = (
  context: EvidenceContext,
  matchers: Array<
    string | RegExp
  >,
): string | null => {
  const files =
    getImplementationFiles(context);

  for (const file of files) {
    const matched =
      matchers.some((matcher) => {
        if (
          typeof matcher ===
          "string"
        ) {
          return file.includes(
            matcher.toLowerCase(),
          );
        }

        return matcher.test(file);
      });

    if (matched) {
      return file;
    }
  }

  return null;
};

export const hasImplementationFile = (
  context: EvidenceContext,
  matchers: Array<
    string | RegExp
  >,
): boolean => {
  return Boolean(
    findImplementationFile(
      context,
      matchers,
    ),
  );
};

/**
 * Temporary compatibility helper.
 *
 * It now searches structural repository evidence only. README text and
 * commit messages can no longer confirm that a technology is implemented.
 *
 * Existing detectors will therefore become conservative until migrated.
 */
export const hasKeyword = (
  context: EvidenceContext,
  keywords: string[],
): boolean => {
  const text =
    getImplementationFiles(
      context,
    ).join(" ");

  return keywords.some(
    (keyword) =>
      text.includes(
        keyword.toLowerCase(),
      ),
  );
};

export const hasFile = (
  context: EvidenceContext,
  matcher: (
    file: string,
  ) => boolean,
): boolean => {
  return getImplementationFiles(
    context,
  ).some(matcher);
};

export const addConfirmedFileTechnology = ({
  context,
  name,
  reason,
  file,
  weight = 90,
  source = "FILE_PATH",
}: {
  context: EvidenceContext;
  name: string;
  reason: string;
  file: string;
  weight?: number;
  source?: TechnologyEvidenceSource;
}): void => {
  context.addTechnology({
    name,
    reason,
    weight,
    strength: "STRONG",
    source,
    evidence: file,
    status: "CONFIRMED",
  });
};