import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Fastify from server and plugin implementation.
 */
export const detectFastifyTechnology: TechnologyDetector = (
  context,
) => {
  const file =
    findImplementationFile(
      context,
      [
        /fastify\.[jt]s$/,
        /fastify[-_.](server|plugin|route|config)\.[jt]s$/,
        /(server|plugin|route)[-_.]fastify\.[jt]s$/,
        /\/plugins\/.*\.[jt]s$/,
        /\/routes\/.*\.[jt]s$/,
        /\/fastify\//,
      ],
    );

  if (!file) {
    return;
  }

  addConfirmedFileTechnology({
    context,
    name: "Fastify",
    reason:
      "Detected Fastify server or plugin implementation.",
    file,
    source: "FILE_PATH",
    weight: 95,
  });
};