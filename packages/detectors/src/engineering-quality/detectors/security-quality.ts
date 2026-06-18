import { QualityDetector } from "../quality-registry";

const hasTechnology = (
  context: Parameters<QualityDetector>[0],
  values: string[]
) => values.some((value) => context.technologies.includes(value));

const hasCapability = (context: Parameters<QualityDetector>[0], key: string) =>
  context.capabilities.some((capability) => capability.key === key);

export const detectSecurityQuality: QualityDetector = (context) => {
  const { addQuality } = context;

  if (hasCapability(context, "AUTHENTICATION")) {
    addQuality(
      "SECURITY",
      30,
      "Authentication or authorization capability was detected."
    );
  }

  if (
    hasTechnology(context, [
      "JWT",
      "OAuth",
      "Role-Based Access Control",
      "API Key Authentication",
    ])
  ) {
    addQuality(
      "SECURITY",
      30,
      "Repository uses explicit access-control technologies such as JWT, OAuth, RBAC, or API keys."
    );
  }

  if (hasTechnology(context, ["Encryption", "Rate Limiting"])) {
    addQuality(
      "SECURITY",
      25,
      "Repository includes security hardening signals such as encryption, hashing, or rate limiting."
    );
  }

  if (context.repositoryTypes.includes("SECURITY_PLATFORM")) {
    addQuality(
      "SECURITY",
      15,
      "Repository identity includes security-focused platform evidence."
    );
  }
};