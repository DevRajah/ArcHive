import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms API key authentication from dedicated key validation or
 * authentication files.
 */
export const detectApiKeyTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)api[-_.]?key\.[jt]sx?$/,
          /(^|\/)api[-_.]?key[-_.](auth|guard|middleware|service|validator|strategy|config)\.[jt]sx?$/,
          /(^|\/)(auth|guard|middleware|service|validator|strategy|config)[-_.]api[-_.]?key\.[jt]sx?$/,
          /\/api[-_.]?keys?\//,
          /\/authentication\/api[-_.]?keys?\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "API Key Authentication",
      reason:
        "Detected API key authentication, validation, guard, middleware, service, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };