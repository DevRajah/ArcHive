import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "node:path";

/*
 * Prisma commands are executed from the ArcHive project root.
 *
 * ArcHive's DATABASE_URL currently lives inside apps/api/.env,
 * so we load that file explicitly before Prisma reads env("DATABASE_URL").
 */
config({
  path: path.resolve(
    process.cwd(),
    "apps/api/.env"
  ),
});

export default defineConfig({
  /*
   * These paths are relative to the location of this config file:
   * packages/database/prisma.config.ts
   */
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});