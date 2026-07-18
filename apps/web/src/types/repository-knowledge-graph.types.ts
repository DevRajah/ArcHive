import type {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  KnowledgeGraphSummary,
} from "@/types/knowledge-graph.types";

export interface RepositoryKnowledgeGraphRepository {
  id: string;
  name: string;
  fullName?: string | null;
}

export interface LegacyKnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface LegacyRepositoryKnowledgeGraphNodes {
  technologies?: string[];
  domains?: string[];
  repositoryTypes?: string[];
  capabilities?: string[];
}

export interface RepositoryKnowledgeGraphResponse {
  repository?: RepositoryKnowledgeGraphRepository | null;

  /*
   * Older responses use this simple relationship array.
   * It remains supported as a fallback.
   */
  graph?: LegacyKnowledgeGraphEdge[];

  nodes?: LegacyRepositoryKnowledgeGraphNodes;

  /*
   * Newer responses provide the richer graph model.
   * The frontend should prefer this when available.
   */
  knowledgeGraph?: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    summary: KnowledgeGraphSummary;
  } | null;
}

export interface NormalizedRepositoryKnowledgeGraph {
  repository?: RepositoryKnowledgeGraphRepository | null;

  graph: {
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
    summary?: KnowledgeGraphSummary;
  };
}