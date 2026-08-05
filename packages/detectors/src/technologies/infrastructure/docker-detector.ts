import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectDockerTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)dockerfile$/,
          /(^|\/)dockerfile\./,
          "docker-compose.yml",
          "docker-compose.yaml",
          "compose.yml",
          "compose.yaml",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Docker",
      reason:
        "Detected Docker configuration files.",
      file,
      source: "CONFIGURATION",
    });
  };