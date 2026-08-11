export type KnowledgeGraphNodeType =
  | "REPOSITORY"
  | "TECHNOLOGY"
  | "ARCHITECTURE_DOMAIN"
  | "REPOSITORY_TYPE"
  | "CAPABILITY"
  | string;

export type KnowledgeGraphEdgeType =
  | "USES_TECHNOLOGY"
  | "HAS_CAPABILITY"
  | "CLASSIFIED_AS"
  | "HAS_ARCHITECTURE_DOMAIN"
  | "REPOSITORY_SIMILARITY"
  | "RELATIONSHIP"
  | string;

export interface KnowledgeGraphNode {
  id: string;
  type: KnowledgeGraphNodeType;
  label: string;
  value?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface KnowledgeGraphSimilarityMetadata {
  similarityScore?: number | null;
  sharedTechnologies?: string[];
  sharedArchitectureDomains?: string[];
  sharedCapabilities?: string[];
  sharedRepositoryTypes?: string[];
}

export interface KnowledgeGraphEdge {
  id?: string;
  source: string;
  target: string;
  type?: KnowledgeGraphEdgeType | null;
  label?: string | null;
  relationship?: string | null;
  metadata?: Record<string, unknown> | null;
  similarity?: KnowledgeGraphSimilarityMetadata | null;
}

export interface KnowledgeGraphSummary {
  totalRepositories: number;
  totalNodes: number;
  totalEdges: number;
  totalTechnologies: number;
  totalArchitectureDomains: number;
  totalRepositoryTypes: number;
  totalCapabilities: number;
  similarityRelationships: number;

  sharedTechnologies?: number;
}

export interface KnowledgeGraphRepositoryDetails {
  id: string;
  name: string;
  fullName?: string | null;
  technologies?: string[];
  architectureDomains?: string[];
  repositoryTypes?: string[];
  capabilities?: string[];
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  summary?: KnowledgeGraphSummary;
}

export interface KnowledgeGraphFilterState {
  repository: string;
  technology: string;
  architectureDomain: string;
  capability: string;
  repositoryType: string;
  similarityOnly: boolean;
}