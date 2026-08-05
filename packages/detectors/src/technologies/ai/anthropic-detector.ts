import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Anthropic only from implementation-backed file paths.
 *
 * A README reference to Claude or Anthropic must not classify a repository
 * as using the Anthropic SDK.
 */
export const detectAnthropicTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)anthropic\.[jt]sx?$/,
          /(^|\/)anthropic[-_.](client|service|provider|adapter|config)\.[jt]sx?$/,
          /(^|\/)(client|service|provider|adapter|config)[-_.]anthropic\.[jt]sx?$/,
          /(^|\/)claude[-_.](client|service|provider|adapter|config)\.[jt]sx?$/,
          /\/anthropic\//,
          /\/providers\/anthropic\//,
          /\/integrations\/anthropic\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Anthropic",
      reason:
        "Detected Anthropic or Claude client, service, provider, adapter, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };