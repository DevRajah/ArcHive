import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectLangChainTechnology: TechnologyDetector = (context) => {
  if (
    hasKeyword(context, [
      "langchain",
      "langgraph",
      "@langchain",
      "langchain/core",
    ])
  ) {
    context.addTechnology(
      "LangChain",
      "Detected LangChain or LangGraph orchestration.",
      25,
      "STRONG"
    );
  }
};