export interface RepositoryPurpose {
  purposeType: string;
  label: string;
  description: string;
}

export interface RepositoryPurposeResponse {
  repository: {
    id: string;
    name: string;
    fullName: string;
  };

  repositoryPurpose?: RepositoryPurpose | null;
  repositoryTypes?: string[];
  reasoningSignals?: string[];
}