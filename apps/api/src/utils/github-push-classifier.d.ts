import { EngineeringEventType } from "@prisma/client";
type PushClassifierInput = {
    filesChanged: string[];
    commitMessages: string[];
    history: {
        hasQueueHistory: boolean;
        hasRedisHistory: boolean;
        hasDockerHistory: boolean;
        hasDatabaseHistory: boolean;
    };
};
export declare const classifyGitHubPushEvent: ({ filesChanged, commitMessages, history, }: PushClassifierInput) => EngineeringEventType;
export {};
//# sourceMappingURL=github-push-classifier.d.ts.map