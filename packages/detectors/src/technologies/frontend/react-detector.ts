import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms React from React-specific source files.
 *
 * Generic folders such as "components/" are deliberately excluded because
 * they are not unique to React.
 */
export const detectReactTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /\.tsx$/,
          /\.jsx$/,
          /(^|\/)react[-_.](client|provider|context|hook|config)\.[jt]sx?$/,
          /(^|\/)(client|provider|context|hook|config)[-_.]react\.[jt]sx?$/,
          /(^|\/)react-app-env\.d\.ts$/,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "React",
      reason:
        "Detected React JSX or TSX implementation files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };