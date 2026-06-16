export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relationship: string;
}

export interface RepositoryKnowledgeGraphResponse {
  graph: KnowledgeGraphEdge[];

  nodes?: {
    technologies?: string[];
    domains?: string[];
    repositoryTypes?: string[];
  };
}