import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectGrpcTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "grpc",
      "@grpc",
      "protobuf",
      ".proto",
      "grpc server",
      "grpc client",
    ])
  ) {
    context.addTechnology(
      "gRPC",
      "Detected gRPC service communication.",
      30,
      "STRONG"
    );
  }
};