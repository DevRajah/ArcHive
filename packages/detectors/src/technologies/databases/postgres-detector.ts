import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectPostgresTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "postgres",
          "postgresql",
          "pgvector",
          "postgres.config",
          "postgres-client",
          "postgres.client",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "PostgreSQL",
      reason:
        "Detected PostgreSQL implementation or configuration files.",
      file,
    });
  };