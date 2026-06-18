import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectPostgresTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "postgres",
      "postgresql",
      "pgvector",
      "pg ",
      "database_url",
    ])
  ) {
    context.addTechnology(
      "PostgreSQL",
      "Detected PostgreSQL database usage.",
      20,
      "STRONG"
    );
  }
};