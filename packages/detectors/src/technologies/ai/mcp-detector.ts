import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms MCP only from dedicated protocol implementation paths.
 *
 * The short string "mcp" is never searched as a general substring because
 * it could occur accidentally inside unrelated filenames.
 */
export const detectMcpTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)mcp[-_.](server|client|transport|handler|service|config)\.[jt]sx?$/,
          /(^|\/)(server|client|transport|handler|service|config)[-_.]mcp\.[jt]sx?$/,
          /\/model-context-protocol\//,
          /\/modelcontextprotocol\//,
          /\/mcp\/(server|client|transport|handlers?|tools?|resources?)\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name:
        "Model Context Protocol (MCP)",
      reason:
        "Detected Model Context Protocol server, client, transport, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };