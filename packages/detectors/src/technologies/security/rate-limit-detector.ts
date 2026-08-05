import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms request rate limiting from dedicated middleware, plugin,
 * guard, service, or configuration files.
 */
export const detectRateLimitingTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)rate[-_.]?limit\.[jt]sx?$/,
          /(^|\/)rate[-_.]?limit[-_.](middleware|plugin|guard|service|config)\.[jt]sx?$/,
          /(^|\/)(middleware|plugin|guard|service|config)[-_.]rate[-_.]?limit\.[jt]sx?$/,
          /(^|\/)throttl(e|er|ing)[-_.](middleware|guard|service|config)\.[jt]sx?$/,
          /\/rate[-_.]?limiting\//,
          /\/throttling\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Rate Limiting",
      reason:
        "Detected rate-limiting or throttling middleware, plugin, guard, service, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };