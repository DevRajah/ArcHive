export interface AdminDashboardResponse {
    totalUsers: number;
    totalRepositories: number;
    trackedRepositories: number;
    engineeringReports: number;
    architectureChanges: number;
    timelineEntries: number;
    engineeringRecommendations: number;
    repositoriesImportedToday: number;
    repositoriesReprocessedToday: number;
    eventProcessing: {
        completed: number;
        failed: number;
    };
}

export interface AdminUser {
    id: string;
    username?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    repositoryCount?: number;
    trackedRepositories?: number;
    createdAt?: string;
    lastActivityAt?: string | null;
    joinedAt?: string | null;
    accountCreatedAt?: string | null;
}

export interface AdminRepository {
    id: string;
    name: string;
    fullName?: string | null;
    owner?: string | null;
    language?: string | null;
    stars?: number;
    forks?: number;
    isTracked?: boolean;
    repositoryType?: string | null;
    architectureDomain?: string | null;
    lastIntelligenceRefreshAt?: string | null;
    timelineCount?: number;
    eventCount?: number;
    architectureChangeCount?: number;
    recommendationCount?: number;
}

export interface AdminSystemResponse {
    apiStatus: string;
    database: string;
    environment: string;
    nodeVersion: string;
    uptime: number;
    memoryUsage: {
        rss?: number;
        heapUsed?: number;
        heapTotal?: number;
    };
}

export interface AdminUserRepository {
    id: string;
    name: string;
    fullName?: string | null;
    description?: string | null;
    language?: string | null;
    stars?: number;
    forks?: number;
    isTracked?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface AdminUserDetails {
    user: AdminUser;
    repositories: AdminUserRepository[];

    stats?: {
        totalRepositories?: number;
        trackedRepositories?: number;
        totalTimelineEntries?: number;
        totalArchitectureChanges?: number;
        totalEngineeringEvents?: number;
    };

    timelineSummary?: {
        recentEntries?: number;
        lastActivityAt?: string | null;
    };
}

export interface AdminRepositoryDetails {
    repository: AdminRepository;

    owner?: AdminUser | null;

    stats?: {
        totalTimelineEntries?: number;
        totalEngineeringEvents?: number;
        totalArchitectureChanges?: number;
        totalRecommendations?: number;
    };

    intelligence?: {
        primaryRepositoryType?: string | null;
        repositoryTypes?: string[];
        architectureDomains?: string[];
        technologies?: string[];
        engineeringProfile?: string | null;
        lastRefreshedAt?: string | null;
    };

    timelineEntries?: Array<{
        id: string;
        title?: string | null;
        description?: string | null;
        createdAt?: string;
    }>;

    architectureChanges?: Array<{
        id: string;
        changeType?: string | null;
        summary?: string | null;
        detectedTechnology?: string | null;
        createdAt?: string;
    }>;

    recommendations?: Array<{
        id: string;
        title?: string | null;
        description?: string | null;
        priority?: string | null;
        status?: string | null;
        createdAt?: string;
    }>;
}

export type AdminActivityType =
    | "ADMIN_AUDIT"
    | "TIMELINE"
    | "ENGINEERING_EVENT"
    | "ARCHITECTURE_CHANGE"
    | string;

export type AdminActivityAction =
    | "REPOSITORY_DELETED"
    | "REPOSITORY_REPROCESSED"
    | "INTELLIGENCE_REFRESHED"
    | string
    | null;

export interface AdminActivityActor {
    userId: string | null;
    username: string | null;
}

export interface AdminActivityRepository {
    id: string;
    name: string | null;
    fullName: string | null;
    deleted: boolean;
}

export interface AdminActivityItem {
    id: string;

    type: AdminActivityType;

    action?: AdminActivityAction;

    title?: string | null;

    description?: string | null;

    createdAt?: string;

    actor?: AdminActivityActor | null;

    repository?: AdminActivityRepository | null;

    metadata?: unknown;
}

export interface AdminActivityResponse {
    activity: AdminActivityItem[];
}

export interface AdminQueueJob {
    id: string;
    name?: string | null;
    status?: string | null;
    failedReason?: string | null;
    timestamp?: string | null;
    createdAt?: string | null;
}

export interface AdminQueueResponse {
    waiting: number;
    active: number;
    completed: number;
    failed: number;
    delayed: number;
    paused: number;
    recentFailedJobs: AdminQueueJob[];
}

export interface AdminAnalyticsDatum {
    name: string;
    value: number;
}

export interface AdminAnalyticsResponse {
    repositoryTypes: AdminAnalyticsDatum[];
    languages: AdminAnalyticsDatum[];
    architectureDomains: AdminAnalyticsDatum[];
    technologies: AdminAnalyticsDatum[];
    engineeringProfiles: AdminAnalyticsDatum[];
}