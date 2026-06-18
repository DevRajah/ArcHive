import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectMcpTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "modelcontextprotocol",
      "mcp server",
      "mcp client",
      "@modelcontextprotocol",
      "mcp transport",
    ])
  ) {
    context.addTechnology(
      "Model Context Protocol (MCP)",
      "Detected Model Context Protocol implementation.",
      30,
      "STRONG"
    );
  }
};