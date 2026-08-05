import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectBullMqTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "bullmq",
          /\.queue\.[jt]s$/,
          /\.worker\.[jt]s$/,
          "/queues/",
          "/workers/",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "BullMQ",
      reason:
        "Detected queue and worker implementation files.",
      file,
      weight: 85,
    });
  };