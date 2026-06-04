export interface RepositoryArchitectureRadarItem {
  domain: string;
  label: string;
  score: number;
  changeCount: number;
}

export interface RepositoryArchitectureRadarResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
    language?: string | null;
  };

  radar: RepositoryArchitectureRadarItem[];
}