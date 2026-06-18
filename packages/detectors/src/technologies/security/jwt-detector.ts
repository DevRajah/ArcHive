import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectJwtTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "jsonwebtoken",
      "jwt.sign",
      "jwt.verify",
      "bearer ",
      "access token",
      "refresh token",
    ])
  ) {
    context.addTechnology(
      "JWT",
      "Detected JWT-based authentication.",
      20,
      "STRONG"
    );
  }
};