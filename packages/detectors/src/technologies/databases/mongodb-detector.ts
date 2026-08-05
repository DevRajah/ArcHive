import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectMongoDbTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "mongoose",
          "mongodb",
          "mongo.config",
          "mongo-client",
          "mongo.client",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "MongoDB",
      reason:
        "Detected MongoDB implementation files.",
      file,
    });
  };