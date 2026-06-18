import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectRbacTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "role",
      "permission",
      "rbac",
      "authorize",
      "admin",
      "middleware",
      "roles",
    ])
  ) {
    context.addTechnology(
      "Role-Based Access Control",
      "Detected role-based authorization.",
      20,
      "STRONG"
    );
  }
};