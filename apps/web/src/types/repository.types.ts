export interface Repository {
  id: string;
  githubRepoId?: string;
  name: string;
  owner?: string;
  fullName: string;
  description?: string | null;
  defaultBranch?: string;
  language?: string | null;
  stars?: number;
  forks?: number;
  isPrivate?: boolean;
  isTracked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface GithubRepository {
  githubRepoId: string;
  name: string;
  owner: string;
  fullName: string;
  description?: string | null;
  defaultBranch?: string;
  language?: string | null;
  isPrivate?: boolean;
}