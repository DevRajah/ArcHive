import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms Vue from single-file components or Vue-specific configuration.
 */
export const detectVueTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /\.vue$/,
          /(^|\/)vue\.config\.(js|cjs|mjs|ts)$/,
          /(^|\/)vite\.config\.[jt]s$/,
          /(^|\/)nuxt\.config\.[jt]s$/,
          /(^|\/)vue[-_.](client|app|plugin|config)\.[jt]s$/,
        ],
      );

    if (!file) {
      return;
    }

    /**
     * A Vite config alone is not Vue-specific.
     *
     * Only accept it when another Vue-specific file also exists.
     */
    if (
      /vite\.config\.[jt]s$/.test(file)
    ) {
      const vueFile =
        findImplementationFile(
          context,
          [
            /\.vue$/,
            /(^|\/)vue\.config\.(js|cjs|mjs|ts)$/,
            /(^|\/)nuxt\.config\.[jt]s$/,
          ],
        );

      if (!vueFile) {
        return;
      }

      addConfirmedFileTechnology({
        context,
        name: "Vue",
        reason:
          "Detected Vue components alongside frontend build configuration.",
        file: vueFile,
        source: "FILE_PATH",
        weight: 90,
      });

      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Vue",
      reason:
        "Detected Vue component or framework configuration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };