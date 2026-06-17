import { EvidenceContext } from "../evidence-types";
import { fileEndsWithAny, includesAny } from "../evidence-utils";

export const detectAiEvidence = (context: EvidenceContext) => {
  const { combinedText, filesChanged, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "tensorflow",
      "pytorch",
      "torch",
      "scikit-learn",
      "sklearn",
    ])
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected machine learning framework dependency",
      35,
      "DEPENDENCY",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "huggingface",
      "transformers",
      "langchain",
      "llamaindex",
      "openai",
      "anthropic",
      "ollama",
    ])
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected AI framework, LLM, or agent tooling",
      35,
      "DEPENDENCY",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "model inference",
      "inference pipeline",
      "model training",
      "train model",
      "ml pipeline",
      "embedding",
      "vector database",
      "rag",
    ])
  ) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected model training, inference, embedding, or RAG pipeline evidence",
      30,
      "ARCHITECTURE_PATTERN",
      "STRONG"
    );
  }

  if (fileEndsWithAny(filesChanged, [".ipynb"])) {
    addEvidence(
      "AI_ML_PROJECT",
      "Detected notebook-based AI/ML workflow",
      20,
      "FILE_STRUCTURE",
      "MEDIUM"
    );
  }
};