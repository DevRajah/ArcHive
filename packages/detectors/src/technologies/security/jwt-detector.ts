import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms JWT authentication from dedicated token implementation files.
 *
 * Generic auth files do not confirm JWT because they may use sessions,
 * API keys, OAuth, or another authentication mechanism.
 */
export const detectJwtTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)jwt\.[jt]sx?$/,
          /(^|\/)jwt[-_.](service|strategy|guard|middleware|helper|utils?|config)\.[jt]sx?$/,
          /(^|\/)(service|strategy|guard|middleware|helper|utils?|config)[-_.]jwt\.[jt]sx?$/,
          /(^|\/)(access|refresh)[-_.]token[-_.](service|helper|utils?|strategy)\.[jt]sx?$/,
          /\/jwt\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "JWT",
      reason:
        "Detected JWT token service, strategy, guard, middleware, helper, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 95,
    });
  };