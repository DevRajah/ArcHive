import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectAwsTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "serverless.yml",
          "serverless.yaml",
          "sam-template",
          "template.yaml",
          "cloudformation",
          "cdk.json",
          "/aws/",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "AWS",
      reason:
        "Detected AWS deployment or infrastructure configuration.",
      file,
      source: "CONFIGURATION",
    });
  };