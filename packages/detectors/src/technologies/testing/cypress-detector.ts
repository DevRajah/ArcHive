import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Cypress through Cypress-specific configuration and directories.
 */
export const detectCypressTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)cypress\.config\.[jt]s$/,
          /\/cypress\/e2e\//,
          /\/cypress\/fixtures\//,
          /\/cypress\/support\//,
          /\/cypress\/plugins\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Cypress",
      reason:
        "Detected Cypress configuration or end-to-end test structure.",
      file,
      source: "CONFIGURATION",
      weight: 95,
    });
  };