import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Vitest from framework-specific configuration files.
 */
export const detectVitestTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)vitest\.config\.(js|ts|cjs|mjs)$/,
          /(^|\/)vitest\.setup\.[jt]s$/,
          /(^|\/)setup-vitest\.[jt]s$/,
          /\/vitest\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Vitest",
      reason:
        "Detected Vitest configuration or setup files.",
      file,
      source: "CONFIGURATION",
      weight: 95,
    });
  };