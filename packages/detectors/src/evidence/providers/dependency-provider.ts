import type {
  EvidenceContext,
} from "../evidence-types";

const DEPENDENCY_MANIFESTS =
  new Set([
    "package.json",
  ]);

const getFileName = (
  filePath: string,
): string => {
  return (
    filePath
      .replace(/\\/g, "/")
      .split("/")
      .pop()
      ?.toLowerCase() ?? ""
  );
};

const isDependencySection = (
  value: unknown,
): value is Record<string, unknown> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

/**
 * Extracts dependency names from repository manifests.
 *
 * This provider does not classify technologies. It only records package
 * evidence for technology detectors to consume later.
 */
export const collectDependencyEvidence = (
  context: EvidenceContext,
): void => {
  for (
    const file of
    context.repositoryFiles
  ) {
    const fileName =
      getFileName(
        file.path,
      );

    if (
      !DEPENDENCY_MANIFESTS.has(
        fileName,
      )
    ) {
      continue;
    }

    context.dependencyFiles.add(
      file.path,
    );

    try {
      const manifest =
        JSON.parse(
          file.content,
        ) as {
          dependencies?: unknown;
          devDependencies?: unknown;
          peerDependencies?: unknown;
          optionalDependencies?: unknown;
        };

      const sections = [
        manifest.dependencies,
        manifest.devDependencies,
        manifest.peerDependencies,
        manifest.optionalDependencies,
      ];

      for (
        const section of sections
      ) {
        if (
          !isDependencySection(
            section,
          )
        ) {
          continue;
        }

        for (
          const dependency of
          Object.keys(section)
        ) {
          context.dependencies.add(
            dependency
              .trim()
              .toLowerCase(),
          );
        }
      }
    } catch {
      /**
       * A malformed manifest must not stop the entire repository analysis.
       */
    }
  }
};