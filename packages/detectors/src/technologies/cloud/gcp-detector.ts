import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectGcpTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "app.yaml",
          "app.yml",
          "cloudbuild.yaml",
          "cloudbuild.yml",
          "firebase.json",
          "/gcp/",
          "/google-cloud/",
          ".gcloudignore",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Google Cloud",
      reason:
        "Detected Google Cloud deployment or infrastructure configuration.",
      file,
      source: "CONFIGURATION",
    });
  };