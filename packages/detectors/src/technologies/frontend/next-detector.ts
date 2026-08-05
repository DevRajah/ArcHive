import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Next.js using framework-specific files and conventions.
 *
 * A generic "app/" directory alone is not enough because many non-Next
 * applications use that folder name.
 */
export const detectNextTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)next\.config\.(js|mjs|cjs|ts)$/,
          /(^|\/)next-env\.d\.ts$/,
          /(^|\/)pages\/_app\.[jt]sx?$/,
          /(^|\/)pages\/_document\.[jt]sx?$/,
          /(^|\/)app\/layout\.[jt]sx?$/,
          /(^|\/)app\/page\.[jt]sx?$/,
          /(^|\/)middleware\.[jt]s$/,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Next.js",
      reason:
        "Detected Next.js framework configuration or routing files.",
      file,
      source: "FILE_PATH",
      weight: 95,
    });
  };