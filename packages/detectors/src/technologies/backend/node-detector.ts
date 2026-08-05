import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Node.js from backend entrypoints and runtime files.
 *
 * We deliberately avoid confirming Node.js simply because ".js"
 * exists inside a repository.
 */
export const detectNodeTechnology: TechnologyDetector = (
  context,
) => {
  const file =
    findImplementationFile(
      context,
      [
        /server\.[jt]s$/,
        /app\.[jt]s$/,
        /index\.[jt]s$/,
        /main\.[jt]s$/,
        /package\.json$/,
        /pnpm-workspace\.yaml$/,
        /tsconfig\.json$/,
      ],
    );

  if (!file) {
    return;
  }

  addConfirmedFileTechnology({
    context,
    name: "Node.js",
    reason:
      "Detected Node.js backend project structure.",
    file,
    source: "FILE_PATH",
    weight: 85,
  });
};