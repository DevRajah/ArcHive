type SummaryInput = {
    repositoryName?: string;
    changeType: string;
    detectedTechnology?: string;
    fileAffected?: string;
    eventType: string;
    rawPayload: Record<string, unknown>;
};

const getCommitMessages = (rawPayload: Record<string, unknown>) => {
    const directMessages = rawPayload.commitMessages;

    if (Array.isArray(directMessages)) {
        return directMessages.filter(
            (message): message is string => typeof message === "string"
        );
    }

    const commits = rawPayload.commits;

    if (!Array.isArray(commits)) return [];

    return commits
        .map((commit) => {
            if (!commit || typeof commit !== "object") return "";

            const typedCommit = commit as { message?: unknown };

            return typeof typedCommit.message === "string" ? typedCommit.message : "";
        })
        .filter(Boolean);
};

const getChangeActionForFile = ({
    rawPayload,
    fileAffected,
}: {
    rawPayload: Record<string, unknown>;
    fileAffected?: string;
}) => {
    if (!fileAffected) return "updated";

    const commits = rawPayload.commits;

    if (!Array.isArray(commits)) return "updated";

    for (const commit of commits) {
        if (!commit || typeof commit !== "object") continue;

        const typedCommit = commit as {
            added?: unknown[];
            modified?: unknown[];
            removed?: unknown[];
        };

        const added = Array.isArray(typedCommit.added) ? typedCommit.added : [];
        const modified = Array.isArray(typedCommit.modified)
            ? typedCommit.modified
            : [];
        const removed = Array.isArray(typedCommit.removed) ? typedCommit.removed : [];

        if (added.includes(fileAffected)) return "added";
        if (modified.includes(fileAffected)) return "updated";
        if (removed.includes(fileAffected)) return "removed";
    }

    return "updated";
};

const includesAny = (value: string, keywords: string[]) => {
    return keywords.some((keyword) => value.includes(keyword));
};

export const generateArchitectureSummary = ({
    changeType,
    detectedTechnology,
    fileAffected,
    eventType,
    rawPayload,
}: SummaryInput) => {
    const file = fileAffected?.toLowerCase() || "";
    const technology = detectedTechnology || "the related system";
    const action = getChangeActionForFile({ rawPayload, fileAffected });
    const commitText = getCommitMessages(rawPayload).join(" ").toLowerCase();
    const contextText = `${file} ${commitText} ${eventType.toLowerCase()} ${changeType.toLowerCase()}`;

    const actionWord =
        action === "added" ? "added" : action === "removed" ? "removed" : "updated";


    if (changeType.includes("REALTIME")) {
        if (includesAny(contextText, ["socket-emitter"])) {
            return `Worker realtime event emitter was ${actionWord} to notify the dashboard after background processing.`;
        }

        if (includesAny(contextText, ["server.ts", "socket.io"])) {
            return `Socket.IO realtime server infrastructure was ${actionWord} for live dashboard updates.`;
        }

        return `Realtime event infrastructure was ${actionWord} for live repository intelligence updates.`;
    }

    // Queue / worker summaries
    if (changeType.includes("QUEUE")) {
        if (includesAny(contextText, ["classifier", "engineering-event-classifier"])) {
            return `Engineering event classification logic was ${actionWord} to better detect queue infrastructure changes.`;
        }

        if (includesAny(contextText, ["queue.routes", "routes/queue"])) {
            return `Queue route handling was ${actionWord} for ${technology}-backed background processing.`;
        }

        if (includesAny(contextText, ["worker", "workers"])) {
            return `Background worker processing was ${actionWord} for queue-driven engineering event handling.`;
        }

        if (action === "added" || changeType.includes("ADDED")) {
            return `Queue-based background processing infrastructure was introduced for asynchronous job handling.`;
        }

        return `Queue infrastructure logic was ${actionWord} to improve background job processing.`;
    }

    // Auth / OAuth summaries
    if (changeType.includes("AUTH")) {
        if (includesAny(contextText, ["github-oauth", "oauth"])) {
            return `GitHub OAuth routing was ${actionWord} to improve authentication and repository access flow.`;
        }

        if (includesAny(contextText, ["github-signature", "signature", "webhook secret"])) {
            return `Webhook signature verification was ${actionWord} to improve GitHub webhook security.`;
        }

        if (includesAny(contextText, ["login", "register", "signup"])) {
            return `User login and registration flow was ${actionWord}.`;
        }

        if (includesAny(contextText, ["jwt", "token", "middleware"])) {
            return `Token authentication and authorization middleware was ${actionWord}.`;
        }

        return `Authentication or authorization logic was ${actionWord}.`;
    }

    // Frontend summaries
    if (changeType.includes("FRONTEND")) {
        if (includesAny(contextText, ["repositoryarchitecturepreview"])) {
            return `Repository architecture preview UI was ${actionWord} to display richer architecture intelligence.`;
        }

        if (includesAny(contextText, ["recentactivity", "recent-engineering"])) {
            return `Recent engineering activity UI was ${actionWord} to show clearer repository intelligence.`;
        }

        if (includesAny(contextText, ["dashboard"])) {
            return `Dashboard UI was ${actionWord} to improve engineering activity visibility.`;
        }

        return `Frontend UI or client-side component architecture was ${actionWord}.`;
    }

    // API summaries
    if (changeType.includes("API")) {
        if (includesAny(contextText, ["github-sync"])) {
            return `GitHub repository sync API logic was ${actionWord} to improve repository metadata and live tracking.`;
        }

        if (includesAny(contextText, ["github.routes", "github/webhook"])) {
            return `GitHub webhook API handling was ${actionWord} for repository event ingestion.`;
        }

        if (includesAny(contextText, ["controller"])) {
            return `Controller logic was ${actionWord} for API request handling.`;
        }

        if (includesAny(contextText, ["service"])) {
            return `Service-layer logic was ${actionWord} for backend business workflows.`;
        }

        return `Backend API routing or service-layer logic was ${actionWord}.`;
    }

    // Database summaries
    if (changeType.includes("DATABASE")) {
        if (includesAny(contextText, ["schema.prisma"])) {
            return `Prisma schema was ${actionWord}, affecting repository data modelling.`;
        }

        if (includesAny(contextText, ["migration"])) {
            return `Database migration files were ${actionWord} to evolve persistence structure.`;
        }

        return `Database schema or persistence-layer architecture was ${actionWord}.`;
    }

    // Docker summaries
    if (changeType.includes("DOCKER")) {
        return `Docker or container configuration was ${actionWord} to improve environment consistency.`;
    }

    // Redis summaries
    if (changeType.includes("REDIS")) {
        return `Redis-backed infrastructure was ${actionWord} for caching, queues, or realtime processing.`;
    }

    // Dependency summaries
    if (changeType.includes("DEPENDENCY")) {
        return `Project dependency configuration was ${actionWord}.`;
    }

    // Type contract summaries
    if (changeType.includes("TYPE_CONTRACT")) {
        return `TypeScript contracts or response data shapes were ${actionWord}.`;
    }

    // State summaries
    if (changeType.includes("STATE")) {
        return `Client-side state or data-fetching logic was ${actionWord}.`;
    }

    if (changeType.includes("ARCHITECTURE_INTELLIGENCE")) {
        return `Repository architecture intelligence and engineering classification logic was ${actionWord}.`;
    }

    return `Architecture intelligence was ${actionWord} based on repository changes.`;
};