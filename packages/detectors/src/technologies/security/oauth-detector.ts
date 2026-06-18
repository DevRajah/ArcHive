import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectOAuthTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "oauth",
      "oauth2",
      "github oauth",
      "google oauth",
      "passport",
      "authorization code",
    ])
  ) {
    context.addTechnology(
      "OAuth",
      "Detected OAuth authentication flow.",
      25,
      "STRONG"
    );
  }
};