import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectAzureTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "azure-pipelines.yml",
          "azure-pipelines.yaml",
          "host.json",
          "local.settings.json",
          "/azure/",
          "/functions/",
          "bicep",
          ".bicep",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Azure",
      reason:
        "Detected Azure deployment or infrastructure configuration.",
      file,
      source: "CONFIGURATION",
    });
  };