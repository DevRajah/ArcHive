import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms native WebSocket infrastructure from dedicated implementation
 * files rather than generic realtime terminology.
 */
export const detectWebSocketTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)websocket\.[jt]sx?$/,
          /(^|\/)websocket[-_.](server|client|gateway|handler|service|config)\.[jt]sx?$/,
          /(^|\/)(server|client|gateway|handler|service|config)[-_.]websocket\.[jt]sx?$/,
          /(^|\/)ws[-_.](server|client|gateway|handler|service|config)\.[jt]sx?$/,
          /\/websockets?\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "WebSocket",
      reason:
        "Detected native WebSocket server, client, gateway, handler, service, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };