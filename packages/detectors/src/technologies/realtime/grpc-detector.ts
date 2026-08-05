import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms gRPC from protocol definitions or dedicated gRPC implementation
 * files.
 *
 * A .proto file is strong evidence because it represents an actual protocol
 * contract rather than a documentation mention.
 */
export const detectGrpcTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /\.proto$/,
          /(^|\/)grpc[-_.](server|client|service|handler|transport|config)\.[jt]sx?$/,
          /(^|\/)(server|client|service|handler|transport|config)[-_.]grpc\.[jt]sx?$/,
          /\/grpc\//,
          /\/protobuf\//,
          /\/protos?\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "gRPC",
      reason:
        "Detected gRPC protocol definitions or implementation files.",
      file,
      source:
        file.endsWith(".proto")
          ? "CONFIGURATION"
          : "FILE_PATH",
      weight: 95,
    });
  };