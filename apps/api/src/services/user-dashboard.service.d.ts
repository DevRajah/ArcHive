export declare const getUserDashboardSummary: (userId: string) => Promise<{
    repositories: number;
    engineeringEvents: number;
    timelineEntries: number;
    architectureChanges: number;
    queueMetrics: {
        [index: string]: number;
    };
    recentEngineeringEvents: {
        id: string;
        eventType: string;
        title: string;
        summary: string;
        source: string;
        createdAt: Date;
        repositoryName: string;
        repositoryFullName: string;
    }[];
    repositoryIntelligence: {
        name: string;
        fullName: string;
        events: number;
        architectureChanges: number;
    }[];
} | null>;
//# sourceMappingURL=user-dashboard.service.d.ts.map