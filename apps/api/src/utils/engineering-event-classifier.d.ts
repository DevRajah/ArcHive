type RawPayload = Record<string, any>;
type RepositoryArchitectureHistory = {
    hasQueueHistory?: boolean;
    hasRedisHistory?: boolean;
    hasDockerHistory?: boolean;
    hasDatabaseHistory?: boolean;
};
type ClassifiedEngineeringEvent = {
    eventType: string;
    title: string;
    summary: string;
};
export declare const classifyEngineeringEventForDashboard: ({ rawEventType, rawPayload, repositoryName, history, }: {
    rawEventType?: string | null;
    rawPayload?: RawPayload;
    repositoryName: string;
    history?: RepositoryArchitectureHistory;
}) => ClassifiedEngineeringEvent;
export {};
//# sourceMappingURL=engineering-event-classifier.d.ts.map