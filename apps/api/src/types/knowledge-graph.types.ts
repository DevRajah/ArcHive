export type KnowledgeGraphNodeType =
  | "REPOSITORY"
  | "TECHNOLOGY"
  | "ARCHITECTURE_DOMAIN"
  | "REPOSITORY_TYPE"
  | "CAPABILITY";

export type KnowledgeGraphEdgeType =
  | "USES_TECHNOLOGY"
  | "HAS_ARCHITECTURE_DOMAIN"
  | "CLASSIFIED_AS"
  | "HAS_CAPABILITY"
  | "SIMILAR_TO";

export type KnowledgeGraphNode = {
  id: string;
  type: KnowledgeGraphNodeType;
  label: string;
  value: string;
  repositoryId: string | null;
  metadata: Record<string, unknown>;
};

export type KnowledgeGraphEdge = {
  id: string;
  source: string;
  target: string;
  type: KnowledgeGraphEdgeType;
  label: string;
  weight: number;
  metadata: Record<string, unknown>;
};

export type RepositoryGraphSignals = {
  technologies: string[];
  architectureDomains: string[];
  repositoryTypes: string[];
  capabilities: string[];
};

export type RepositoryKnowledgeGraph = {
  repository: {
    id: string;
    name: string;
    fullName: string;
  };

  signals: RepositoryGraphSignals;

  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];

  summary: {
    totalNodes: number;
    totalEdges: number;
    technologies: number;
    architectureDomains: number;
    repositoryTypes: number;
    capabilities: number;
  };
};

export type PortfolioKnowledgeGraph = {
  user: {
    id: string;
    username: string;
    avatarUrl: string | null;
  };

  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];

  repositories: Array<{
    id: string;
    name: string;
    fullName: string;
    signals: RepositoryGraphSignals;
  }>;

  summary: {
    totalRepositories: number;
    totalNodes: number;
    totalEdges: number;
    totalTechnologies: number;
    totalArchitectureDomains: number;
    totalRepositoryTypes: number;
    totalCapabilities: number;
    similarityRelationships: number;
  };
};