import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Supertest only from files explicitly associated with
 * API integration testing.
 *
 * Generic test files and the word "request" are not sufficient.
 */
export const detectSupertestTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)supertest\.[jt]s$/,
          /(^|\/)supertest[-_.](setup|client|helper|config)\.[jt]s$/,
          /(^|\/)(setup|client|helper|config)[-_.]supertest\.[jt]s$/,
          /\/supertest\//,
          /\/integration\/.*supertest.*\.[jt]s$/,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Supertest",
      reason:
        "Detected Supertest API integration testing files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };