import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Server-Sent Events from dedicated SSE or event-stream
 * implementation files.
 *
 * The short string "sse" is never searched as a general substring.
 */
export const detectSseTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)sse[-_.](controller|route|handler|service|stream|client|server|config)\.[jt]sx?$/,
          /(^|\/)(controller|route|handler|service|stream|client|server|config)[-_.]sse\.[jt]sx?$/,
          /(^|\/)server[-_.]sent[-_.]events?\.[jt]sx?$/,
          /(^|\/)event[-_.]stream[-_.](controller|route|handler|service|client|server)\.[jt]sx?$/,
          /\/server[-_.]sent[-_.]events?\//,
          /\/sse\/(controllers?|routes?|handlers?|services?|streams?|clients?|servers?)\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Server-Sent Events",
      reason:
        "Detected Server-Sent Events controller, route, handler, service, stream, client, or server files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };