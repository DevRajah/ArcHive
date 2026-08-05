import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectGitHubActionsTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          ".github/workflows/",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name:
        "GitHub Actions",
      reason:
        "Detected GitHub Actions workflow files.",
      file,
      source: "CONFIGURATION",
    });
  };