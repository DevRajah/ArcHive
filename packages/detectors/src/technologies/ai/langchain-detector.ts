import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

/**
 * Confirms LangChain or LangGraph from dedicated implementation paths.
 *
 * General words such as "chain", "agent", or "graph" are intentionally
 * excluded because they are too broad and cause false classifications.
 */
export const detectLangChainTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          /(^|\/)langchain\.[jt]sx?$/,
          /(^|\/)langgraph\.[jt]sx?$/,
          /(^|\/)(langchain|langgraph)[-_.](client|service|agent|workflow|graph|config)\.[jt]sx?$/,
          /\/langchain\//,
          /\/langgraph\//,
          /\/integrations\/langchain\//,
          /\/integrations\/langgraph\//,
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "LangChain",
      reason:
        "Detected LangChain or LangGraph implementation and orchestration files.",
      file,
      source: "FILE_PATH",
      weight: 90,
    });
  };