import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms role-based access control from dedicated role and permission
 * enforcement files.
 *
 * Generic middleware, admin pages, or the word "role" alone are deliberately
 * excluded.
 */
export const detectRbacTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const roleFile =
      findImplementationFile(
        context,
        [
          /(^|\/)rbac\.[jt]sx?$/,
          /(^|\/)rbac[-_.](service|guard|middleware|policy|config)\.[jt]sx?$/,
          /(^|\/)(service|guard|middleware|policy|config)[-_.]rbac\.[jt]sx?$/,
          /(^|\/)roles?[-_.](guard|middleware|service|policy|decorator|permission)\.[jt]sx?$/,
          /(^|\/)permissions?[-_.](guard|middleware|service|policy|decorator|role)\.[jt]sx?$/,
          /\/rbac\//,
          /\/authorization\/roles?\//,
          /\/authorization\/permissions?\//,
        ],
      );

    if (!roleFile) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Role-Based Access Control",
      reason:
        "Detected role and permission enforcement files.",
      file: roleFile,
      source: "FILE_PATH",
      weight: 95,
    });
  };