import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms OpenAI only when the repository contains an implementation
 * or configuration file clearly associated with the OpenAI integration.
 *
 * General mentions such as "GPT-4" in documentation are deliberately
 * excluded because they do not prove that the SDK is implemented.
 */
export const detectOpenAiTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)openai\.[jt]sx?$/,
          /(^|\/)openai[-_.](client|service|provider|adapter|config)\.[jt]sx?$/,
          /(^|\/)(client|service|provider|adapter|config)[-_.]openai\.[jt]sx?$/,
          /\/openai\//,
          /\/providers\/openai\//,
          /\/integrations\/openai\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "OpenAI",
      reason:
        "Detected OpenAI client, service, provider, adapter, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };