export interface IntelligencePhaseHighlight {
  summary?: string | null;
  evolutionSummary?: string | null;
  createdAt?: string | null;
}

export interface IntelligenceTimelinePhase {
  domain: string;
  phaseType: string;
  title: string;
  description?: string | null;
  startedAt?: string | null;
  latestActivityAt?: string | null;
  totalChanges: number;
  technologies?: string[];
  highlights?: IntelligencePhaseHighlight[];
}

export interface RepositoryIntelligenceTimelineResponse {
  repository?: {
    id: string;
    name: string;
    fullName: string;
  };

  timelineType: string;
  phases: IntelligenceTimelinePhase[];
}