import type {
  KnowledgeGraphEdge,
  KnowledgeGraphNode,
  KnowledgeGraphSummary,
} from "@/types/knowledge-graph.types";

export interface PortfolioKnowledgeGraphUser {
  id: string;
  username?: string | null;
  email?: string | null;
  avatarUrl?: string | null;
}

export interface PortfolioKnowledgeGraphRepository {
  id: string;
  name: string;
  fullName?: string | null;
  language?: string | null;
  isTracked?: boolean;

  technologies?: string[];
  architectureDomains?: string[];
  repositoryTypes?: string[];
  capabilities?: string[];
}

export interface PortfolioKnowledgeGraphSummary
  extends KnowledgeGraphSummary {
  repositories: number;
  sharedTechnologies: number;
  repositorySimilarityRelationships: number;
}

export interface PortfolioKnowledgeGraphResponse {
  user: PortfolioKnowledgeGraphUser;

  nodes: KnowledgeGraphNode[];

  edges: KnowledgeGraphEdge[];

  repositories: PortfolioKnowledgeGraphRepository[];

  summary: PortfolioKnowledgeGraphSummary;
}