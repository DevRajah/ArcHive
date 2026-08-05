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

export const collectDependencyEvidence = (
  context: EvidenceContext,
): void => {
  for (
    const file of
    context.repositoryFiles
  ) {
    const fileName =
      getFileName(file.path);

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
        ) as Record<
          string,
          unknown
        >;

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
          !section ||
          typeof section !==
            "object" ||
          Array.isArray(section)
        ) {
          continue;
        }

        for (
          const dependency of
          Object.keys(section)
        ) {
          context.dependencies.add(
            dependency.toLowerCase(),
          );
        }
      }
    } catch {
      /**
       * One malformed manifest must not stop repository analysis.
       */
    }
  }
};