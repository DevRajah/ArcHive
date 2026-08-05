import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms encryption or password hashing from dedicated cryptographic
 * implementation files.
 *
 * A generic crypto.ts file is accepted only when its filename indicates an
 * actual cryptographic responsibility.
 */
export const detectEncryptionTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)(encryption|encryptor|decryptor|cryptography)\.[jt]sx?$/,
          /(^|\/)(encryption|crypto)[-_.](service|helper|utils?|provider|config)\.[jt]sx?$/,
          /(^|\/)(service|helper|utils?|provider|config)[-_.](encryption|crypto)\.[jt]sx?$/,
          /(^|\/)(bcrypt|argon2)[-_.](service|helper|utils?|provider|config)\.[jt]sx?$/,
          /(^|\/)password[-_.](hash|hasher|hashing|service|helper|utils?)\.[jt]sx?$/,
          /(^|\/)(hash|hasher|hashing)[-_.]password\.[jt]sx?$/,
          /\/encryption\//,
          /\/cryptography\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Encryption",
      reason:
        "Detected encryption, cryptography, password hashing, or secure key handling files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };