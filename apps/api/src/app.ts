import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.routes";
import { repositoryRoutes } from "./routes/repository.routes";


// This makes future testing easier because I can import the app without starting the port.
export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  // I keep routes modular so ArcHive does not become messy as it grows.
  await app.register(healthRoutes, {
    prefix: "/api/health",
  });

   await app.register(repositoryRoutes, {
    prefix: "/api/repositories",
  });

  return app;
};