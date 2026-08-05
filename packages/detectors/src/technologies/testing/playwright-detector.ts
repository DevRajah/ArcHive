import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Playwright from framework-specific configuration and test folders.
 */
export const detectPlaywrightTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)playwright\.config\.[jt]s$/,
          /\/playwright\//,
          /\/tests\/.*\.spec\.[jt]s$/,
          /\/e2e\/.*\.spec\.[jt]s$/,
        ],
      );

    if (!file) {
      return;
    }

    /**
     * A generic *.spec.ts file does not prove Playwright.
     * Require a Playwright config or dedicated Playwright directory.
     */
    if (
      /\.spec\.[jt]s$/.test(file)
    ) {
      const frameworkEvidence =
        findImplementationFile(
          context,
          [
            /(^|\/)playwright\.config\.[jt]s$/,
            /\/playwright\//,
          ],
        );

      if (!frameworkEvidence) {
        return;
      }

      addConfirmedFileTechnology({
        context,
        name: "Playwright",
        reason:
          "Detected Playwright configuration and browser test files.",
        file:
          frameworkEvidence,
        source: "CONFIGURATION",
        weight: 95,
      });

      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Playwright",
      reason:
        "Detected Playwright configuration or test structure.",
      file,
      source: "CONFIGURATION",
      weight: 95,
    });
  };