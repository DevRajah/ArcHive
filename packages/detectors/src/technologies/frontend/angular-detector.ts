import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Angular using files that are specific to Angular projects.
 */
export const detectAngularTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)angular\.json$/,
          /(^|\/)app\.module\.ts$/,
          /(^|\/)app\.component\.ts$/,
          /\.module\.ts$/,
          /\.component\.ts$/,
          /\.directive\.ts$/,
          /\.pipe\.ts$/,
        ],
      );

    if (!file) {
      return;
    }

    /**
     * Generic component files could appear in other TypeScript projects.
     * Require angular.json or an Angular module when the first match is weak.
     */
    if (
      /\.component\.ts$/.test(file) ||
      /\.directive\.ts$/.test(file) ||
      /\.pipe\.ts$/.test(file)
    ) {
      const angularRootEvidence =
        findImplementationFile(
          context,
          [
            /(^|\/)angular\.json$/,
            /(^|\/)app\.module\.ts$/,
            /\.module\.ts$/,
          ],
        );

      if (!angularRootEvidence) {
        return;
      }

      addConfirmedFileTechnology({
        context,
        name: "Angular",
        reason:
          "Detected Angular modules and component architecture.",
        file:
          angularRootEvidence,
        source: "FILE_PATH",
        weight: 95,
      });

      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Angular",
      reason:
        "Detected Angular project configuration or module files.",
      file,
      source: "FILE_PATH",
      weight: 95,
    });
  };