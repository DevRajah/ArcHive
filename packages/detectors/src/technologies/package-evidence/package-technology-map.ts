export type PackageTechnologyDefinition = {
  technology: string;

  /**
   * Exact dependency or package import names.
   */
  packages: string[];

  /**
   * Some packages are development tooling, while others represent
   * runtime implementation.
   */
  category:
    | "RUNTIME"
    | "DEVELOPMENT"
    | "INFRASTRUCTURE";

  /**
   * Human-readable explanation stored with the evidence.
   */
  description: string;
};

export const PACKAGE_TECHNOLOGY_MAP:
  PackageTechnologyDefinition[] = [
    {
      technology: "React",
      packages: [
        "react",
        "react-dom",
      ],
      category: "RUNTIME",
      description:
        "Detected React runtime dependencies or imports.",
    },

    {
      technology: "Next.js",
      packages: [
        "next",
      ],
      category: "RUNTIME",
      description:
        "Detected the Next.js framework package.",
    },

    {
      technology: "Vue",
      packages: [
        "vue",
        "@vue/runtime-core",
      ],
      category: "RUNTIME",
      description:
        "Detected Vue runtime dependencies or imports.",
    },

    {
      technology: "Angular",
      packages: [
        "@angular/core",
        "@angular/common",
      ],
      category: "RUNTIME",
      description:
        "Detected Angular framework dependencies.",
    },

    {
      technology: "Node.js",
      packages: [
        "@types/node",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Node.js project type definitions.",
    },

    {
      technology: "Express",
      packages: [
        "express",
      ],
      category: "RUNTIME",
      description:
        "Detected the Express web framework.",
    },

    {
      technology: "Fastify",
      packages: [
        "fastify",
      ],
      category: "RUNTIME",
      description:
        "Detected the Fastify web framework.",
    },

    {
      technology: "NestJS",
      packages: [
        "@nestjs/core",
        "@nestjs/common",
        "@nestjs/platform-express",
        "@nestjs/platform-fastify",
      ],
      category: "RUNTIME",
      description:
        "Detected NestJS framework packages.",
    },

    {
      technology: "PostgreSQL",
      packages: [
        "pg",
        "postgres",
        "postgres.js",
      ],
      category: "RUNTIME",
      description:
        "Detected PostgreSQL client dependencies.",
    },

    {
      technology: "MongoDB",
      packages: [
        "mongodb",
        "mongoose",
      ],
      category: "RUNTIME",
      description:
        "Detected MongoDB client or Mongoose dependencies.",
    },

    {
      technology: "MySQL",
      packages: [
        "mysql",
        "mysql2",
      ],
      category: "RUNTIME",
      description:
        "Detected MySQL client dependencies.",
    },

    {
      technology: "Redis",
      packages: [
        "redis",
        "ioredis",
        "@upstash/redis",
      ],
      category: "INFRASTRUCTURE",
      description:
        "Detected Redis client dependencies.",
    },

    {
      technology: "Prisma ORM",
      packages: [
        "@prisma/client",
        "prisma",
      ],
      category: "RUNTIME",
      description:
        "Detected Prisma ORM dependencies.",
    },

    {
      technology: "TypeORM",
      packages: [
        "typeorm",
      ],
      category: "RUNTIME",
      description:
        "Detected TypeORM dependencies.",
    },

    {
      technology: "Sequelize",
      packages: [
        "sequelize",
        "sequelize-typescript",
      ],
      category: "RUNTIME",
      description:
        "Detected Sequelize dependencies.",
    },

    {
      technology: "BullMQ",
      packages: [
        "bullmq",
      ],
      category: "INFRASTRUCTURE",
      description:
        "Detected BullMQ background job infrastructure.",
    },

    {
      technology: "Kafka",
      packages: [
        "kafkajs",
        "node-rdkafka",
      ],
      category: "INFRASTRUCTURE",
      description:
        "Detected Kafka client dependencies.",
    },

    {
      technology: "RabbitMQ",
      packages: [
        "amqplib",
      ],
      category: "INFRASTRUCTURE",
      description:
        "Detected AMQP and RabbitMQ client dependencies.",
    },

    {
      technology: "Socket.IO",
      packages: [
        "socket.io",
        "socket.io-client",
      ],
      category: "RUNTIME",
      description:
        "Detected Socket.IO realtime dependencies.",
    },

    {
      technology: "WebSocket",
      packages: [
        "ws",
      ],
      category: "RUNTIME",
      description:
        "Detected native WebSocket implementation dependencies.",
    },

    {
      technology: "OpenAI",
      packages: [
        "openai",
        "@ai-sdk/openai",
      ],
      category: "RUNTIME",
      description:
        "Detected OpenAI SDK dependencies.",
    },

    {
      technology: "Anthropic",
      packages: [
        "@anthropic-ai/sdk",
        "@ai-sdk/anthropic",
      ],
      category: "RUNTIME",
      description:
        "Detected Anthropic SDK dependencies.",
    },

    {
      technology: "LangChain",
      packages: [
        "langchain",
        "@langchain/core",
        "@langchain/openai",
        "@langchain/anthropic",
      ],
      category: "RUNTIME",
      description:
        "Detected LangChain orchestration dependencies.",
    },

    {
      technology: "Model Context Protocol (MCP)",
      packages: [
        "@modelcontextprotocol/sdk",
      ],
      category: "RUNTIME",
      description:
        "Detected the Model Context Protocol SDK.",
    },

    {
      technology: "Jest",
      packages: [
        "jest",
        "ts-jest",
        "@jest/globals",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Jest testing dependencies.",
    },

    {
      technology: "Vitest",
      packages: [
        "vitest",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Vitest testing dependencies.",
    },

    {
      technology: "Supertest",
      packages: [
        "supertest",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Supertest API integration testing.",
    },

    {
      technology: "Playwright",
      packages: [
        "@playwright/test",
        "playwright",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Playwright browser testing dependencies.",
    },

    {
      technology: "Cypress",
      packages: [
        "cypress",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Cypress end-to-end testing dependencies.",
    },

    {
      technology: "Vite",
      packages: [
        "vite",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected the Vite build tool.",
    },

    {
      technology: "Turborepo",
      packages: [
        "turbo",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Turborepo workspace tooling.",
    },

    {
      technology: "Nx",
      packages: [
        "nx",
        "@nx/workspace",
      ],
      category: "DEVELOPMENT",
      description:
        "Detected Nx workspace tooling.",
    },

    {
      technology: "OAuth",
      packages: [
        "passport",
        "passport-github2",
        "passport-google-oauth20",
        "simple-oauth2",
      ],
      category: "RUNTIME",
      description:
        "Detected OAuth authentication dependencies.",
    },

    {
      technology: "JWT",
      packages: [
        "jsonwebtoken",
        "jose",
        "@nestjs/jwt",
      ],
      category: "RUNTIME",
      description:
        "Detected JWT authentication dependencies.",
    },

    {
      technology: "Rate Limiting",
      packages: [
        "express-rate-limit",
        "@fastify/rate-limit",
        "rate-limiter-flexible",
      ],
      category: "RUNTIME",
      description:
        "Detected request rate-limiting dependencies.",
    },
  ];