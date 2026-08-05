import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Jest using Jest-specific configuration and test files.
 *
 * Generic names such as describe(), expect(), and *.test.ts are excluded
 * because they are shared by several testing frameworks.
 */
export const detectJestTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)jest\.config\.(js|ts|cjs|mjs)$/,
          /(^|\/)jest\.setup\.[jt]s$/,
          /(^|\/)setup-jest\.[jt]s$/,
          /\/__mocks__\//,
          /\/jest\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Jest",
      reason:
        "Detected Jest configuration, setup, or mock files.",
      file,
      source: "CONFIGURATION",
      weight: 95,
    });
  };