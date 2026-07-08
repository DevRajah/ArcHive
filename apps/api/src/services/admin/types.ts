export interface AdminDashboardSummary {
  totalUsers: number;
  totalRepositories: number;
  trackedRepositories: number;
  totalArchitectureChanges: number;
  totalTimelineEvents: number;
  totalEngineeringReports: number;
  repositoriesImportedToday: number;
  repositoriesReprocessedToday: number;
}

export interface AdminUserSummary {
  id: string;
  githubUsername: string;
  avatarUrl: string | null;
  joinedAt: Date;
  repositoryCount: number;
  trackedRepositories: number;
  lastActivity: Date | null;
}

export interface AdminRepositorySummary {
  id: string;
  name: string;
  owner: string;
  primaryRepositoryType: string;
  engineeringProfile: string;
  repositoryHealth: string;
  lastUpdated: Date;
  tracked: boolean;
}

export interface AdminActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface AdminAnalytics {
  repositoryTypes: {
    name: string;
    count: number;
  }[];

  engineeringProfiles: {
    name: string;
    count: number;
  }[];

  architectureDomains: {
    name: string;
    count: number;
  }[];

  languages: {
    name: string;
    count: number;
  }[];

  technologies: {
    name: string;
    count: number;
  }[];
}

export interface QueueOverview {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: number;
  averageProcessingTime: number;
}

export interface SystemOverview {
  environment: string;
  apiVersion: string;
  nodeVersion: string;
  uptime: number;
  database: "CONNECTED" | "DISCONNECTED";
  redis: "CONNECTED" | "DISCONNECTED";
}