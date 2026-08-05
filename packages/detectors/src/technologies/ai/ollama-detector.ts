import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Ollama from dedicated local-model integration files.
 *
 * Model names such as Llama, Mistral, or DeepSeek are not sufficient
 * evidence because those models can be accessed through many providers.
 */
export const detectOllamaTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)ollama\.[jt]sx?$/,
          /(^|\/)ollama[-_.](client|service|provider|adapter|config)\.[jt]sx?$/,
          /(^|\/)(client|service|provider|adapter|config)[-_.]ollama\.[jt]sx?$/,
          /\/ollama\//,
          /\/providers\/ollama\//,
          /\/integrations\/ollama\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Ollama",
      reason:
        "Detected Ollama client, service, provider, adapter, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };