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
): value is Record<
  string,
  unknown
> => {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
};

/**
 * Stores a dependency and its declared version.
 *
 * Monorepos may contain several package.json files. If the same dependency
 * appears more than once, we keep the first concrete version and replace
 * workspace-only references when a better version is later discovered.
 */
const registerDependency = ({
  context,
  dependency,
  version,
}: {
  context: EvidenceContext;
  dependency: string;
  version: unknown;
}): void => {
  const normalizedDependency =
    dependency
      .trim()
      .toLowerCase();

  if (!normalizedDependency) {
    return;
  }

  context.dependencies.add(
    normalizedDependency,
  );

  if (
    typeof version !== "string" ||
    !version.trim()
  ) {
    return;
  }

  const normalizedVersion =
    version.trim();

  const existingVersion =
    context.dependencyVersions.get(
      normalizedDependency,
    );

  /**
   * Prefer a concrete package version over workspace or local references.
   */
  const existingIsReference =
    existingVersion?.startsWith(
      "workspace:",
    ) ||
    existingVersion?.startsWith(
      "file:",
    ) ||
    existingVersion?.startsWith(
      "link:",
    );

  const incomingIsReference =
    normalizedVersion.startsWith(
      "workspace:",
    ) ||
    normalizedVersion.startsWith(
      "file:",
    ) ||
    normalizedVersion.startsWith(
      "link:",
    );

  if (
    !existingVersion ||
    (
      existingIsReference &&
      !incomingIsReference
    )
  ) {
    context.dependencyVersions.set(
      normalizedDependency,
      normalizedVersion,
    );
  }
};

/**
 * Extracts dependency names and declared versions from package.json files.
 *
 * This provider only gathers evidence. Technology classification remains
 * inside the technology detector pipeline.
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
          const [
            dependency,
            version,
          ] of Object.entries(
            section,
          )
        ) {
          registerDependency({
            context,
            dependency,
            version,
          });
        }
      }
    } catch {
      /**
       * A malformed package.json must not stop repository analysis.
       */
    }
  }
};