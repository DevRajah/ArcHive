import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Socket.IO from dedicated Socket.IO implementation files.
 *
 * Generic files such as socket.ts are not sufficient on their own because
 * they may implement native WebSocket or an unrelated socket protocol.
 */
export const detectSocketIoTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)socket[-_.]?io\.[jt]sx?$/,
          /(^|\/)socket[-_.]?io[-_.](server|client|gateway|adapter|service|config)\.[jt]sx?$/,
          /(^|\/)(server|client|gateway|adapter|service|config)[-_.]socket[-_.]?io\.[jt]sx?$/,
          /\/socket[-_.]?io\//,
          /\/integrations\/socket[-_.]?io\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Socket.IO",
      reason:
        "Detected dedicated Socket.IO server, client, gateway, adapter, service, or configuration files.",
      file,
      source: "FILE_PATH",
      weight: 95,
    });
  };