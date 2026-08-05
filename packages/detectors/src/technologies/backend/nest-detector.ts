import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms NestJS from framework-specific structure.
 */
export const detectNestTechnology: TechnologyDetector = (
  context,
) => {
  const file =
    findImplementationFile(
      context,
      [
        /main\.ts$/,
        /app\.module\.ts$/,
        /\.module\.ts$/,
        /\.controller\.ts$/,
        /\.service\.ts$/,
        /\/nestjs\//,
      ],
    );

  if (!file) {
    return;
  }

  /**
   * Prevent generic *.service.ts files from triggering unless
   * a Nest module also exists.
   */
  if (
    /\.service\.ts$/.test(file)
  ) {
    const moduleFile =
      findImplementationFile(
        context,
        [
          /app\.module\.ts$/,
          /\.module\.ts$/,
        ],
      );

    if (!moduleFile) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "NestJS",
      reason:
        "Detected NestJS module architecture.",
      file: moduleFile,
      source: "FILE_PATH",
      weight: 95,
    });

    return;
  }

  addConfirmedFileTechnology({
    context,
    name: "NestJS",
    reason:
      "Detected NestJS framework files.",
    file,
    source: "FILE_PATH",
    weight: 95,
  });
};