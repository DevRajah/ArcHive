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
import fastifyRawBody from "fastify-raw-body";
import { githubSyncRoutes } from "./routes/github-sync.routes";
import { devRoutes } from "./routes/dev.routes";
import { userRoutes } from "./routes/user.routes";
import { githubOAuthRoutes } from "./routes/github-oauth.routes";
import adminRoutes from "./routes/admin";
import { portfolioRoutes } from "./routes/portfolio.routes";
import { portfolioIntelligenceRoutes } from "./routes/portfolio-intelligence.routes";
import { portfolioKnowledgeGraphRoutes } from "./routes/portfolio-knowledge-graph.routes";
import { technologyIntelligenceRoutes } from "./routes/technology-intelligence.routes";
import { dependencyIntelligenceRoutes } from "./routes/dependency-intelligence.routes";
import { architectureAdvisorRoutes } from "./routes/architecture-advisor.routes";

// This makes future testing easier because I can import the app without starting the port.
export const buildApp = async () => {
  const app = Fastify({
    logger: true,
  });

  await app.register(cors, {
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  // I keep routes modular so ArcHive does not become messy as it grows.
  await app.register(healthRoutes, {
    prefix: "/api/health",
  });

  app.register(adminRoutes, {
    prefix: "/api/admin",
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


  await app.register(architectureAdvisorRoutes, {
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

  await app.register(githubSyncRoutes, {
    prefix: "/api/github",
  });

  await app.register(devRoutes, {
    prefix: "/api/dev",
  });

  await app.register(userRoutes, {
    prefix: "/api/users",
  });

  await app.register(portfolioRoutes, {
    prefix: "/api/users",
  });

  await app.register(portfolioIntelligenceRoutes, {
    prefix: "/api/users",
  });

  await app.register(portfolioKnowledgeGraphRoutes, {
    prefix: "/api/users",
  });

  await app.register(technologyIntelligenceRoutes, {
    prefix: "/api/users",
  });

  await app.register(dependencyIntelligenceRoutes, {
    prefix: "/api/users",
  });

  await app.register(githubOAuthRoutes, {
    prefix: "/api/github/oauth",
  });

  return app;
};