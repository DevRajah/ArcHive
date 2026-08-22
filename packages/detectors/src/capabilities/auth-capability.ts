import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectAuthCapability = (context: CapabilityContext) => {
  const {
  evidenceContext,
  addCapability,
} = context;

const {
  combinedText,
} = evidenceContext;

  if (
    includesAny(combinedText, [
      "jwt",
      "oauth",
      "openid",
      "oidc",
      "passport",
      "auth.js",
      "clerk",
      "supabase auth",
      "firebase auth",
      "authorization",
      "authentication",
      "rbac",
    ])
  ) {
    addCapability(
      "AUTHENTICATION",
      88,
      "Repository contains authentication, authorization, OAuth, JWT, or RBAC evidence."
    );
  }
};