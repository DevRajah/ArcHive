import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Express from implementation files rather than README mentions.
 */
export const detectExpressTechnology: TechnologyDetector = (
  context,
) => {
  const file =
    findImplementationFile(
      context,
      [
        /express\.[jt]s$/,
        /express[-_.](server|app|router|routes|middleware|config)\.[jt]s$/,
        /(server|app|router|routes)[-_.]express\.[jt]s$/,
        /\/express\//,
      ],
    );

  if (!file) {
    return;
  }

  addConfirmedFileTechnology({
    context,
    name: "Express",
    reason:
      "Detected Express implementation files.",
    file,
    source: "FILE_PATH",
    weight: 90,
  });
};