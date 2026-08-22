import { includesAny } from "../evidence/evidence-utils";
import { CapabilityContext } from "./types";

export const detectApiCapability = (context: CapabilityContext) => {
  const {
  evidenceContext,
  addCapability,
} = context;

const {
  combinedText,
} = evidenceContext;

  if (
    includesAny(combinedText, [
      "express",
      "fastify",
      "nestjs",
      "hono",
      "koa",
      "router",
      "controller",
      "middleware",
      "rest api",
      "graphql",
    ])
  ) {
    addCapability(
      "API_LAYER",
      90,
      "Repository contains API routing, controller, or middleware architecture."
    );
  }
};