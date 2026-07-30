import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Get the directory containing this Prisma config file.
 *
 * We do not use process.cwd() because Prisma commands may be run from
 * either the ArcHive root or packages/database.
 */
const configDirectory = path.dirname(
  fileURLToPath(import.meta.url),
);

/*
 * prisma.config.ts lives at:
 *
 * packages/database/prisma.config.ts
 *
 * Going up two folders takes us back to the ArcHive project root.
 */
const projectRoot = path.resolve(
  configDirectory,
  "../..",
);

/*
 * ArcHive keeps its backend environment variables in apps/api/.env.
 */
const environmentFile = path.join(
  projectRoot,
  "apps/api/.env",
);

config({
  path: environmentFile,
});

export default defineConfig({
  /*
   * These paths are resolved relative to this Prisma config file.
   */
  schema: "prisma/schema.prisma",

  migrations: {
    path: "prisma/migrations",
  },

  datasource: {
    url: env("DATABASE_URL"),
  },
});