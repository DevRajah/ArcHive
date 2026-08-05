import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms OAuth from dedicated OAuth provider, callback, strategy, or
 * configuration files.
 */
export const detectOAuthTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)oauth2?\.[jt]sx?$/,
          /(^|\/)oauth2?[-_.](client|service|provider|strategy|callback|route|config)\.[jt]sx?$/,
          /(^|\/)(client|service|provider|strategy|callback|route|config)[-_.]oauth2?\.[jt]sx?$/,
          /(^|\/)(github|google|microsoft|facebook|discord)[-_.]oauth[-_.](client|service|provider|strategy|callback|route|config)\.[jt]sx?$/,
          /\/oauth2?\//,
          /\/auth\/providers\//,
          /\/passport\/strategies\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "OAuth",
      reason:
        "Detected OAuth client, provider, strategy, callback, route, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 95,
    });
  };