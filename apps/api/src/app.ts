import Fastify from "fastify";
import cors from "@fastify/cors";
import { healthRoutes } from "./routes/health.routes";
import { repositoryRoutes } from "./routes/repository.routes";
import { engineeringEventRoutes } from "./routes/engineering-event.routes";
import { timelineRoutes } from "./routes/timeline.routes";
import { architectureChangeRoutes } from "./routes/architecture-change.routes";
import { queueRoutes } from "./routes/queue.routes";
import { dashboardRoutes } from "./routes/dashboard.routes";
import { githubRoutes } from "./routes/github.routes";


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

  await app.register(engineeringEventRoutes, {
    prefix: "/api/repositories",
  });

  await app.register(timelineRoutes, {
    prefix: "/api/repositories",
  });

  await app.register(architectureChangeRoutes, {
    prefix: "/api/repositories",
  });

  await app.register(queueRoutes, {
    prefix: "/api/queues",
  });

  await app.register(dashboardRoutes, {
    prefix: "/api/dashboard",
  });

  await app.register(githubRoutes, {
    prefix: "/api/github",
  });

  return app;
};