import { prisma } from "@archive/database";

import type {
    RepositoryTimelineResponse,
    TimelineEvent,
    TimelineEventType,
    TimelineFilters,
    TimelinePagination,
    TimelineSeverity,
    TimelineSummary,
} from "../types/timeline.types";

import {
    hasSufficientAdvisorRiskEvidence,
} from "./organization/organization.utils";

/*
|--------------------------------------------------------------------------
| Internal helper types
|--------------------------------------------------------------------------
|
| Some evidence models contain JSON fields or fields that may evolve over
| time. We normalize their values safely rather than making the Timeline
| contract depend directly on every Prisma model property.
|--------------------------------------------------------------------------
*/

type UnknownRecord = Record<string, unknown>;

type RepositoryTimelineOptions = TimelineFilters;

export class TimelineRepositoryNotFoundError extends Error {
    constructor(repositoryId: string) {
        super(`Repository ${repositoryId} was not found`);
        this.name = "TimelineRepositoryNotFoundError";
    }
}

/*
|--------------------------------------------------------------------------
| General value helpers
|--------------------------------------------------------------------------
*/

const asRecord = (value: unknown): UnknownRecord => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        return value as UnknownRecord;
    }

    return {};
};

const asString = (
    value: unknown,
    fallback = "",
): string => {
    return typeof value === "string" && value.trim().length > 0
        ? value
        : fallback;
};

const asNumber = (
    value: unknown,
    fallback = 0,
): number => {
    if (typeof value === "number" && Number.isFinite(value)) {
        return value;
    }

    if (typeof value === "string") {
        const parsed = Number(value);

        if (Number.isFinite(parsed)) {
            return parsed;
        }
    }

    return fallback;
};

const asStringArray = (value: unknown): string[] => {
    if (!Array.isArray(value)) {
        return [];
    }

    return value.filter(
        (item): item is string =>
            typeof item === "string",
    );
};

const toIsoDate = (
    value: unknown,
    fallback = new Date(),
): string => {
    if (value instanceof Date) {
        return value.toISOString();
    }

    if (typeof value === "string") {
        const parsed = new Date(value);

        if (!Number.isNaN(parsed.getTime())) {
            return parsed.toISOString();
        }
    }

    return fallback.toISOString();
};

const clamp = (
    value: number,
    minimum: number,
    maximum: number,
): number => {
    return Math.min(
        maximum,
        Math.max(minimum, value),
    );
};

/*
|--------------------------------------------------------------------------
| Severity normalisation
|--------------------------------------------------------------------------
|
| Not every evidence source has a severity column.
|
| Where severity exists, we preserve it.
| Where it does not, we derive a sensible visual importance level.
|--------------------------------------------------------------------------
*/
const normalizeSeverity = (
    value: unknown,
    fallback: TimelineSeverity = "INFO",
): TimelineSeverity => {
    const normalized = asString(value).toUpperCase();

    if (
        normalized === "INFO" ||
        normalized === "LOW" ||
        normalized === "MEDIUM" ||
        normalized === "HIGH" ||
        normalized === "CRITICAL"
    ) {
        return normalized;
    }

    return fallback;
};

const severityFromImportance = (
    importanceScore: number,
): TimelineSeverity => {
    if (importanceScore >= 9) {
        return "CRITICAL";
    }

    if (importanceScore >= 7) {
        return "HIGH";
    }

    if (importanceScore >= 4) {
        return "MEDIUM";
    }

    return "LOW";
};

const severityFromScoreChange = (
    difference: number,
): TimelineSeverity => {
    const absoluteDifference = Math.abs(difference);

    if (absoluteDifference >= 20) {
        return "CRITICAL";
    }

    if (absoluteDifference >= 10) {
        return "HIGH";
    }

    if (absoluteDifference >= 5) {
        return "MEDIUM";
    }

    return "LOW";
};

/*
|--------------------------------------------------------------------------
| Text helpers
|--------------------------------------------------------------------------
*/

const humanizeValue = (value: unknown): string => {
    const text = asString(value, "Repository activity");

    return text
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (letter) =>
            letter.toUpperCase(),
        );
};

const firstAvailableString = (
    record: UnknownRecord,
    fields: string[],
    fallback: string,
): string => {
    for (const field of fields) {
        const value = record[field];

        if (
            typeof value === "string" &&
            value.trim().length > 0
        ) {
            return value;
        }
    }

    return fallback;
};

const firstAvailableNumber = (
    record: UnknownRecord,
    fields: string[],
    fallback = 0,
): number => {
    for (const field of fields) {
        const value = record[field];
        const number = asNumber(value, Number.NaN);

        if (Number.isFinite(number)) {
            return number;
        }
    }

    return fallback;
};

/*
|--------------------------------------------------------------------------
| Engineering Event normaliser
|--------------------------------------------------------------------------
*/

const normalizeEngineeringEvent = (
    rawValue: unknown,
    repositoryId: string,
): TimelineEvent => {
    const event = asRecord(rawValue);

    const eventType = firstAvailableString(
        event,
        ["eventType", "type", "category"],
        "ENGINEERING_EVENT",
    );

    const title = firstAvailableString(
        event,
        ["title", "name"],
        humanizeValue(eventType),
    );

    const summary = firstAvailableString(
        event,
        ["summary", "description", "message"],
        "Repository engineering activity was detected.",
    );

    const filesChanged = asStringArray(
        event.filesChanged,
    );

    const commitCount = firstAvailableNumber(
        event,
        ["commitCount", "commits"],
        0,
    );

    return {
        id: asString(
            event.id,
            `engineering-${repositoryId}-${toIsoDate(
                event.createdAt,
            )}`,
        ),

        repositoryId,

        type: "ENGINEERING_EVENT",

        title,

        description: summary,

        severity: normalizeSeverity(
            event.severity,
            "INFO",
        ),

        timestamp: toIsoDate(
            event.occurredAt ??
            event.timestamp ??
            event.createdAt,
        ),

        metadata: {
            source: "EngineeringEvent",
            eventType,
            commitCount,
            filesChanged,
            payload: event.payload ?? null,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Architecture Change normaliser
|--------------------------------------------------------------------------
*/

const normalizeArchitectureChange = (
    rawValue: unknown,
    repositoryId: string,
): TimelineEvent => {
    const change = asRecord(rawValue);

    const changeType = firstAvailableString(
        change,
        [
            "changeType",
            "type",
            "category",
            "domain",
        ],
        "ARCHITECTURE_CHANGE",
    );

    const title = firstAvailableString(
        change,
        ["title", "name"],
        `${humanizeValue(changeType)} detected`,
    );

    const description = firstAvailableString(
        change,
        [
            "summary",
            "description",
            "reason",
            "explanation",
        ],
        "A repository architecture change was detected.",
    );

    const importanceScore = firstAvailableNumber(
        change,
        [
            "importanceScore",
            "impactScore",
            "confidenceScore",
        ],
        1,
    );

    return {
        id: asString(
            change.id,
            `architecture-${repositoryId}-${toIsoDate(
                change.createdAt,
            )}`,
        ),

        repositoryId,

        type: "ARCHITECTURE_CHANGE",

        title,

        description,

        severity: normalizeSeverity(
            change.severity,
            "INFO",
        ),

        timestamp: toIsoDate(
            change.detectedAt ??
            change.occurredAt ??
            change.createdAt,
        ),

        metadata: {
            source: "ArchitectureChange",
            changeType,
            importanceScore,
            previousValue:
                change.previousValue ?? null,
            currentValue:
                change.currentValue ?? null,
            changedFiles:
                change.changedFiles ?? [],
        },
    };
};

/*
|--------------------------------------------------------------------------
| Intelligence Snapshot normaliser
|--------------------------------------------------------------------------
*/

const normalizeIntelligenceSnapshot = (
    rawValue: unknown,
    repositoryId: string,
): TimelineEvent => {
    const snapshot = asRecord(rawValue);

    const engineeringQualityScore =
        firstAvailableNumber(snapshot, [
            "engineeringQualityScore",
            "qualityScore",
        ]);

    const maturityScore =
        firstAvailableNumber(snapshot, [
            "repositoryMaturityScore",
            "maturityScore",
        ]);

    const productionReadinessScore =
        firstAvailableNumber(snapshot, [
            "productionReadinessScore",
            "readinessScore",
        ]);

    const architectureScore =
        firstAvailableNumber(snapshot, [
            "architectureScore",
        ]);

    const healthScore =
        firstAvailableNumber(snapshot, [
            "repositoryHealthScore",
            "healthScore",
            "overallScore",
        ]);

    const availableScores = [
        engineeringQualityScore,
        maturityScore,
        productionReadinessScore,
        architectureScore,
        healthScore,
    ].filter((score) => score > 0);

    const averageScore =
        availableScores.length > 0
            ? Math.round(
                availableScores.reduce(
                    (total, score) => total + score,
                    0,
                ) / availableScores.length,
            )
            : 0;

    return {
        id: asString(
            snapshot.id,
            `intelligence-${repositoryId}-${toIsoDate(
                snapshot.createdAt,
            )}`,
        ),

        repositoryId,

        type: "INTELLIGENCE_SNAPSHOT",

        title: "Repository intelligence snapshot generated",

        description:
            averageScore > 0
                ? `Repository intelligence was recalculated with an average score of ${averageScore}.`
                : "Repository intelligence was recalculated.",

        severity: "INFO",

        timestamp: toIsoDate(snapshot.createdAt),

        metadata: {
            source: "RepositoryIntelligenceSnapshot",
            engineeringQualityScore,
            repositoryMaturityScore: maturityScore,
            productionReadinessScore,
            architectureScore,
            repositoryHealthScore: healthScore,
            averageScore,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Intelligence snapshot timeline compression
|--------------------------------------------------------------------------
|
| Repository intelligence snapshots are valuable historical evidence, but
| showing every recalculation in the default timeline creates unnecessary
| noise.
|
| We keep the first snapshot and then surface another snapshot only when at
| least one canonical intelligence score moves by a meaningful amount.
|
| The complete snapshot history remains available when the user explicitly
| filters the timeline to INTELLIGENCE_SNAPSHOT events.
|--------------------------------------------------------------------------
*/

const INTELLIGENCE_TIMELINE_CHANGE_THRESHOLD = 3;

const getIntelligenceTimelineScores = (
    event: TimelineEvent,
): number[] => {
    const metadata = event.metadata;

    return [
        metadata.engineeringQualityScore,
        metadata.repositoryMaturityScore,
        metadata.productionReadinessScore,
        metadata.architectureScore,
        metadata.repositoryHealthScore,
    ].map((value) =>
        typeof value === "number"
            ? value
            : 0,
    );
};

const hasMeaningfulIntelligenceChange = (
    previous: TimelineEvent,
    current: TimelineEvent,
): boolean => {
    const previousScores =
        getIntelligenceTimelineScores(previous);

    const currentScores =
        getIntelligenceTimelineScores(current);

    return currentScores.some(
        (score, index) =>
            Math.abs(
                score - previousScores[index],
            ) >= INTELLIGENCE_TIMELINE_CHANGE_THRESHOLD,
    );
};

const compressIntelligenceTimeline = (
    snapshots: TimelineEvent[],
): TimelineEvent[] => {
    if (snapshots.length <= 1) {
        return snapshots;
    }

    const compressed: TimelineEvent[] = [
        snapshots[0],
    ];

    for (
        let index = 1;
        index < snapshots.length;
        index += 1
    ) {
        const previousSnapshot =
            snapshots[index - 1];

        const currentSnapshot =
            snapshots[index];

        if (
            hasMeaningfulIntelligenceChange(
                previousSnapshot,
                currentSnapshot,
            )
        ) {
            compressed.push(currentSnapshot);
        }
    }

    return compressed;
};

/*
|--------------------------------------------------------------------------
| Architecture Advisor Snapshot normaliser
|--------------------------------------------------------------------------
*/

const normalizeAdvisorSnapshot = (
    rawValue: unknown,
    repositoryId: string,
): TimelineEvent => {
    const snapshot = asRecord(rawValue);

    const overallAssessment =
        firstAvailableString(
            snapshot,
            ["overallAssessment"],
            "Architecture advisor analysis completed.",
        );

    const maturityLabel =
        firstAvailableString(
            snapshot,
            ["maturityLabel"],
            "Unknown",
        );

    const overallRiskScore =
        firstAvailableNumber(
            snapshot,
            ["overallRiskScore"],
            0,
        );

    const confidenceScore =
        firstAvailableNumber(
            snapshot,
            ["confidenceScore"],
            0,
        );
    /**
 * Timeline severity describes the significance of the timeline event.
 *
 * It is not itself a repository risk classification.
 *
 * When Advisor evidence is insufficient, overallRiskScore = 0 means
 * "no reliable risk judgement", not "confirmed LOW risk".
 *
 * The timeline event may still be LOW severity because an incomplete
 * Advisor assessment is simply a low-severity informational event.
 */
    const evidenceIsSufficient =
        hasSufficientAdvisorRiskEvidence(
            snapshot.evidenceSummary,
        );

    const advisorEventSeverity: TimelineSeverity =
        !evidenceIsSufficient
            ? "INFO"
            : overallRiskScore >= 80
                ? "CRITICAL"
                : overallRiskScore >= 60
                    ? "HIGH"
                    : overallRiskScore >= 30
                        ? "MEDIUM"
                        : "LOW";

    return {
        id: asString(
            snapshot.id,
            `advisor-${repositoryId}-${toIsoDate(
                snapshot.generatedAt,
            )}`,
        ),

        repositoryId,

        type: "ARCHITECTURE_ADVISOR",

        title: "Architecture advisor analysis generated",

        description: overallAssessment,

        severity: advisorEventSeverity,

        timestamp: toIsoDate(
            snapshot.generatedAt,
        ),

        metadata: {
            source: "ArchitectureAdvisorSnapshot",

            maturityLabel,

            overallRiskScore,

            confidenceScore,

            evidenceIsSufficient,

            strengths:
                snapshot.strengths ?? [],

            architectureConcerns:
                snapshot.architectureConcerns ?? [],

            productionRisks:
                snapshot.productionRisks ?? [],

            securityObservations:
                snapshot.securityObservations ?? [],

            scalabilityConcerns:
                snapshot.scalabilityConcerns ?? [],

            reliabilityConcerns:
                snapshot.reliabilityConcerns ?? [],

            maintainabilityConcerns:
                snapshot.maintainabilityConcerns ?? [],

            observabilityConcerns:
                snapshot.observabilityConcerns ?? [],

            dataConcerns:
                snapshot.dataConcerns ?? [],

            deliveryConcerns:
                snapshot.deliveryConcerns ?? [],

            priorityActions:
                snapshot.priorityActions ?? [],

            recommendedNextSteps:
                snapshot.recommendedNextSteps ?? [],

            evidenceSummary:
                snapshot.evidenceSummary ?? [],

            sourceIntelligenceSnapshotId:
                snapshot.sourceIntelligenceSnapshotId ??
                null,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Manual Timeline Entry normaliser
|--------------------------------------------------------------------------
*/

const normalizeTimelineEntry = (
    rawValue: unknown,
    repositoryId: string,
): TimelineEvent => {
    const entry = asRecord(rawValue);

    const importanceScore =
        firstAvailableNumber(
            entry,
            ["importanceScore"],
            1,
        );

    const relatedEvent = asRecord(
        entry.relatedEvent,
    );

    return {
        id: asString(
            entry.id,
            `timeline-${repositoryId}-${toIsoDate(
                entry.createdAt,
            )}`,
        ),

        repositoryId,

        type: "TIMELINE_ENTRY",

        title: firstAvailableString(
            entry,
            ["title"],
            "Timeline entry",
        ),

        description: firstAvailableString(
            entry,
            ["summary", "description"],
            "Repository timeline activity was recorded.",
        ),

        severity:
            severityFromImportance(importanceScore),

        timestamp: toIsoDate(entry.createdAt),

        metadata: {
            source: "TimelineEntry",
            relatedEventId:
                entry.relatedEventId ?? null,
            importanceScore,
            generatedByAI:
                entry.generatedByAI ?? false,
            relatedEvent:
                Object.keys(relatedEvent).length > 0
                    ? relatedEvent
                    : null,
        },
    };
};

/*
|--------------------------------------------------------------------------
| Health Trend event builder
|--------------------------------------------------------------------------
|
| Health Trend events are derived from consecutive intelligence snapshots.
|
| We do not create extra database records here. The Timeline reconstructs the
| health movement from immutable intelligence evidence whenever it is read.
|--------------------------------------------------------------------------
*/

const getSnapshotHealthScore = (
    rawValue: unknown,
): number => {
    const snapshot = asRecord(rawValue);

    return firstAvailableNumber(
        snapshot,
        [
            "repositoryHealthScore",
            "healthScore",
            "overallScore",
        ],
        0,
    );
};

const buildHealthTrendEvents = (
    rawSnapshots: unknown[],
    repositoryId: string,
): TimelineEvent[] => {
    const snapshots = [...rawSnapshots].sort(
        (first, second) => {
            const firstTime = new Date(
                toIsoDate(asRecord(first).createdAt),
            ).getTime();

            const secondTime = new Date(
                toIsoDate(asRecord(second).createdAt),
            ).getTime();

            return firstTime - secondTime;
        },
    );

    const events: TimelineEvent[] = [];

    for (
        let index = 1;
        index < snapshots.length;
        index += 1
    ) {
        const previousSnapshot = asRecord(
            snapshots[index - 1],
        );

        const currentSnapshot = asRecord(
            snapshots[index],
        );

        const previousScore =
            getSnapshotHealthScore(previousSnapshot);

        const currentScore =
            getSnapshotHealthScore(currentSnapshot);

        /*
        | Do not create misleading trend events when either snapshot does not
        | contain a usable repository health score.
        */
        if (
            previousScore <= 0 ||
            currentScore <= 0
        ) {
            continue;
        }

        const difference =
            currentScore - previousScore;

        /*
        | An unchanged score is still visible through the intelligence snapshot,
        | so we only create a Health Trend event when an actual movement occurred.
        */
        if (difference === 0) {
            continue;
        }

        const direction =
            difference > 0
                ? "improved"
                : "declined";

        const currentSnapshotId = asString(
            currentSnapshot.id,
            `${index}`,
        );

        events.push({
            id: `health-trend-${currentSnapshotId}`,

            repositoryId,

            type: "HEALTH_TREND",

            title: `Repository health ${direction}`,

            description: `Repository health ${direction} from ${previousScore} to ${currentScore}.`,

            severity:
                severityFromScoreChange(difference),

            timestamp: toIsoDate(
                currentSnapshot.createdAt,
            ),

            metadata: {
                source:
                    "RepositoryIntelligenceSnapshotComparison",
                previousSnapshotId:
                    previousSnapshot.id ?? null,
                currentSnapshotId:
                    currentSnapshot.id ?? null,
                previousScore,
                currentScore,
                difference,
                direction,
            },
        });
    }

    return events;
};

/*
|--------------------------------------------------------------------------
| Filtering
|--------------------------------------------------------------------------
*/

const applyTimelineFilters = (
    timeline: TimelineEvent[],
    filters: TimelineFilters,
): TimelineEvent[] => {
    const search = filters.search
        ?.trim()
        .toLowerCase();

    const fromDate = filters.from
        ? new Date(filters.from)
        : null;

    const toDate = filters.to
        ? new Date(filters.to)
        : null;

    return timeline.filter((event) => {
        if (
            filters.type &&
            event.type !== filters.type
        ) {
            return false;
        }

        if (
            filters.severity &&
            event.severity !== filters.severity
        ) {
            return false;
        }

        if (search) {
            const searchableText = [
                event.title,
                event.description,
                event.type,
                JSON.stringify(event.metadata),
            ]
                .join(" ")
                .toLowerCase();

            if (!searchableText.includes(search)) {
                return false;
            }
        }

        const eventTimestamp = new Date(
            event.timestamp,
        );

        if (
            fromDate &&
            !Number.isNaN(fromDate.getTime()) &&
            eventTimestamp < fromDate
        ) {
            return false;
        }

        if (
            toDate &&
            !Number.isNaN(toDate.getTime())
        ) {
            /*
            | When the frontend sends only a date such as 2026-07-24, include the
            | entire day rather than stopping at midnight.
            */
            const inclusiveToDate = new Date(toDate);

            if (
                filters.to &&
                !filters.to.includes("T")
            ) {
                inclusiveToDate.setHours(
                    23,
                    59,
                    59,
                    999,
                );
            }

            if (eventTimestamp > inclusiveToDate) {
                return false;
            }
        }

        return true;
    });
};

/*
|--------------------------------------------------------------------------
| Summary
|--------------------------------------------------------------------------
*/

const buildTimelineSummary = (
    timeline: TimelineEvent[],
): TimelineSummary => {
    const timestamps = timeline
        .map((event) =>
            new Date(event.timestamp).getTime(),
        )
        .filter((timestamp) =>
            Number.isFinite(timestamp),
        );

    const countType = (
        type: TimelineEventType,
    ): number => {
        return timeline.filter(
            (event) => event.type === type,
        ).length;
    };

    return {
        totalEvents: timeline.length,

        engineeringEvents: countType(
            "ENGINEERING_EVENT",
        ),

        architectureChanges: countType(
            "ARCHITECTURE_CHANGE",
        ),

        intelligenceSnapshots: countType(
            "INTELLIGENCE_SNAPSHOT",
        ),

        advisorSnapshots: countType(
            "ARCHITECTURE_ADVISOR",
        ),

        healthTrendEvents: countType(
            "HEALTH_TREND",
        ),

        timelineEntries: countType(
            "TIMELINE_ENTRY",
        ),

        firstRecordedAt:
            timestamps.length > 0
                ? new Date(
                    Math.min(...timestamps),
                ).toISOString()
                : null,

        lastRecordedAt:
            timestamps.length > 0
                ? new Date(
                    Math.max(...timestamps),
                ).toISOString()
                : null,
    };
};

/*
|--------------------------------------------------------------------------
| Pagination
|--------------------------------------------------------------------------
*/

const buildPagination = (
    page: number,
    limit: number,
    totalItems: number,
): TimelinePagination => {
    const totalPages =
        totalItems === 0
            ? 0
            : Math.ceil(totalItems / limit);

    return {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage:
            totalPages > 0 && page < totalPages,
        hasPreviousPage: page > 1,
    };
};

/*
|--------------------------------------------------------------------------
| Main Timeline service
|--------------------------------------------------------------------------
*/

export const getRepositoryTimeline = async (
    repositoryId: string,
    options: RepositoryTimelineOptions = {},
): Promise<RepositoryTimelineResponse> => {
    const repository =
        await prisma.repository.findUnique({
            where: {
                id: repositoryId,
            },
        });

    if (!repository) {
        throw new TimelineRepositoryNotFoundError(
            repositoryId,
        );
    }

    /*
    | All evidence sources are independent, so we read them concurrently.
    | This is faster than waiting for every database query one after another.
    */
    const [
        engineeringEvents,
        architectureChanges,
        intelligenceSnapshots,
        advisorSnapshots,
        timelineEntries,
    ] = await Promise.all([
        prisma.engineeringEvent.findMany({
            where: {
                repositoryId,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),

        prisma.architectureChange.findMany({
            where: {
                repositoryId,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),

        prisma.repositoryIntelligenceSnapshot.findMany({
            where: {
                repositoryId,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),

        prisma.architectureAdvisorSnapshot.findMany({
            where: {
                repositoryId,
            },
            orderBy: {
                generatedAt: "asc",
            },
        }),

        prisma.timelineEntry.findMany({
            where: {
                repositoryId,
            },
            include: {
                relatedEvent: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        }),
    ]);

    /*
    | Normalise each database model into the shared frontend contract.
    */
    const normalizedEngineeringEvents =
        engineeringEvents.map((event) =>
            normalizeEngineeringEvent(
                event,
                repositoryId,
            ),
        );

    const normalizedArchitectureChanges =
        architectureChanges.map((change) =>
            normalizeArchitectureChange(
                change,
                repositoryId,
            ),
        );

    const normalizedIntelligenceSnapshots =
        intelligenceSnapshots.map((snapshot) =>
            normalizeIntelligenceSnapshot(
                snapshot,
                repositoryId,
            ),
        );

    const compressedIntelligenceSnapshots =
        compressIntelligenceTimeline(
            normalizedIntelligenceSnapshots,
        );


    const normalizedAdvisorSnapshots =
        advisorSnapshots.map((snapshot) =>
            normalizeAdvisorSnapshot(
                snapshot,
                repositoryId,
            ),
        );

    const normalizedTimelineEntries =
        timelineEntries.map((entry) =>
            normalizeTimelineEntry(
                entry,
                repositoryId,
            ),
        );

    const healthTrendEvents =
        buildHealthTrendEvents(
            intelligenceSnapshots,
            repositoryId,
        );

    /*
| Explicit snapshot filtering is an audit/history request, so preserve every
| stored snapshot. The general timeline uses the compressed representation.
*/
    const intelligenceTimelineEvents =
        options.type === "INTELLIGENCE_SNAPSHOT"
            ? normalizedIntelligenceSnapshots
            : compressedIntelligenceSnapshots;
    /*
    | Summary counts describe the complete stored evidence history, not only the
    | events selected for presentation in the default feed.
    */
    const completeEvidenceTimeline: TimelineEvent[] = [
        ...normalizedEngineeringEvents,
        ...normalizedArchitectureChanges,
        ...normalizedIntelligenceSnapshots,
        ...normalizedAdvisorSnapshots,
        ...healthTrendEvents,
        ...normalizedTimelineEntries,
    ];
    const completeTimeline: TimelineEvent[] = [
        ...normalizedEngineeringEvents,
        ...normalizedArchitectureChanges,
        ...intelligenceTimelineEvents,
        ...normalizedIntelligenceSnapshots,
        ...normalizedAdvisorSnapshots,
        ...healthTrendEvents,
        ...normalizedTimelineEntries,
    ];

    /*
    | Summary is based on all repository evidence before user filters and
    | pagination are applied. This keeps the summary cards stable while the
    | user searches or switches event categories.
    */
    const summary = buildTimelineSummary(
        completeEvidenceTimeline,
    );

    const filteredTimeline =
        applyTimelineFilters(
            completeTimeline,
            options,
        );

    const order =
        options.order === "asc"
            ? "asc"
            : "desc";

    filteredTimeline.sort((first, second) => {
        const firstTimestamp = new Date(
            first.timestamp,
        ).getTime();

        const secondTimestamp = new Date(
            second.timestamp,
        ).getTime();

        return order === "asc"
            ? firstTimestamp - secondTimestamp
            : secondTimestamp - firstTimestamp;
    });

    const page = clamp(
        Math.floor(options.page ?? 1),
        1,
        Number.MAX_SAFE_INTEGER,
    );

    const limit = clamp(
        Math.floor(options.limit ?? 25),
        1,
        100,
    );

    const totalItems =
        filteredTimeline.length;

    const startIndex =
        (page - 1) * limit;

    const paginatedTimeline =
        filteredTimeline.slice(
            startIndex,
            startIndex + limit,
        );

    const pagination = buildPagination(
        page,
        limit,
        totalItems,
    );

    const repositoryRecord =
        repository as unknown as UnknownRecord;

    return {
        repository: {
            id: repository.id,

            name: repository.name,

            /*
            | ArcHive repositories may call this field fullName or full_name,
            | depending on the original import model. Fall back to the name so
            | the frontend always receives a usable value.
            */
            fullName: firstAvailableString(
                repositoryRecord,
                ["fullName", "full_name"],
                repository.name,
            ),
        },

        summary,

        timeline: paginatedTimeline,

        pagination,

        generatedAt: new Date().toISOString(),
    };
};

/*
|--------------------------------------------------------------------------
| Summary-only service
|--------------------------------------------------------------------------
*/

export const getRepositoryTimelineSummary =
    async (
        repositoryId: string,
    ): Promise<TimelineSummary> => {
        const result =
            await getRepositoryTimeline(
                repositoryId,
                {
                    page: 1,
                    limit: 1,
                },
            );

        return result.summary;
    };

/*
|--------------------------------------------------------------------------
| Refresh service
|--------------------------------------------------------------------------
|
| Timeline evidence already exists in its source tables.
|
| Refresh therefore means "rebuild the normalized Timeline response from the
| latest stored evidence." It does not generate fake activity or duplicate
| TimelineEntry records.
|--------------------------------------------------------------------------
*/

export const refreshRepositoryTimeline =
    async (
        repositoryId: string,
        options: RepositoryTimelineOptions = {},
    ): Promise<RepositoryTimelineResponse> => {
        return getRepositoryTimeline(
            repositoryId,
            options,
        );
    };