import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectDatabaseCapability = (context: CapabilityContext) => {
  const { combinedText, addCapability } = context;

  if (
    includesAny(combinedText, [
      "prisma",
      "typeorm",
      "drizzle",
      "mongoose",
      "sequelize",
      "migration",
      "schema.prisma",
      "postgres",
      "mysql",
      "mongodb",
    ])
  ) {
    addCapability(
      "DATABASE_LAYER",
      92,
      "Repository shows database schema, ORM, migration, or persistence-layer evidence."
    );
  }
};