import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectEncryptionTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "bcrypt",
      "argon2",
      "crypto",
      "aes",
      "rsa",
      "sha256",
      "encrypt",
      "decrypt",
    ])
  ) {
    context.addTechnology(
      "Encryption",
      "Detected encryption or hashing technologies.",
      25,
      "STRONG"
    );
  }
};