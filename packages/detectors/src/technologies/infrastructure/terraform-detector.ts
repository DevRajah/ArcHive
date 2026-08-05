import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectTerraformTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /\.tf$/,
          /\.tfvars$/,
          /\.terraform\.lock\.hcl$/,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Terraform",
      reason:
        "Detected Terraform configuration files.",
      file,
      source: "CONFIGURATION",
    });
  };