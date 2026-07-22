import { prisma } from "@archive/database";

import {
    HISTORY,
    HEALTH_SCORE_WEIGHTS,
    REPOSITORY_DIRECTION,
    RISK_LEVELS,
    TREND_THRESHOLDS,
} from "../constants/health-trends.constants";

import type {
    HealthMetricTrend,
    RepositoryHealthChange,
    RepositoryHealthHistoryPoint,
    RepositoryHealthResponse,
    RepositoryHealthSummary,
    RepositoryHealthTrends,
    RepositoryLatestScores,
    RepositoryTrendDirection,
    RiskLevel,
    TrendDirection,
} from "../types/health-trends.types";

/*
|--------------------------------------------------------------------------
| Repository Health Trends Service
|--------------------------------------------------------------------------
|
| Repository Health is NOT another source of truth.
|
| Everything returned by this service is derived from immutable evidence
| already collected by ArcHive.
|
| Evidence Sources
|
| • Repository Intelligence Snapshots
| • Architecture Advisor Snapshots
|
| Nothing here is AI generated.
|
|--------------------------------------------------------------------------
*/

type SnapshotPair = {
    intelligence: {
        id: string;

        createdAt: Date;

        architectureScore: number | null;

        engineeringQualityScore: number | null;

        productionReadinessScore: number | null;

        capabilityScore: number | null;

        maturityScore: number | null;

        confidenceScore: number | null;
    };

    advisor: {
        id: string;

        overallRiskScore: number;

        confidenceScore: number;

        generatedAt: Date;

        sourceIntelligenceSnapshotId: string | null;
    } | null;
};

const clamp = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

const safe = (value: number | null | undefined) =>
    value ?? 0;

/*
|--------------------------------------------------------------------------
| Composite Repository Health
|--------------------------------------------------------------------------
|
| Higher risk decreases health.
|--------------------------------------------------------------------------
*/

const calculateHealthScore = (
    snapshot: SnapshotPair
) => {
    const architecture =
        safe(snapshot.intelligence.architectureScore);

    const engineering =
        safe(
            snapshot.intelligence
                .engineeringQualityScore
        );

    const production =
        safe(
            snapshot.intelligence
                .productionReadinessScore
        );

    const capability =
        safe(snapshot.intelligence.capabilityScore);

    const maturity =
        safe(snapshot.intelligence.maturityScore);

    const confidence =
        snapshot.advisor?.confidenceScore ??
        safe(snapshot.intelligence.confidenceScore);

    const risk =
        snapshot.advisor?.overallRiskScore ?? 0;

    return clamp(
        architecture *
        HEALTH_SCORE_WEIGHTS.architecture +

        engineering *
        HEALTH_SCORE_WEIGHTS.engineeringQuality +

        production *
        HEALTH_SCORE_WEIGHTS.productionReadiness +

        capability *
        HEALTH_SCORE_WEIGHTS.capability +

        maturity *
        HEALTH_SCORE_WEIGHTS.maturity +

        confidence *
        HEALTH_SCORE_WEIGHTS.confidence +

        (100 - risk) *
        HEALTH_SCORE_WEIGHTS.risk
    );
};

const determineTrendDirection = (
    change: number | null
): TrendDirection => {
    if (change === null) {
        return "INSUFFICIENT_DATA";
    }

    if (
        change >= TREND_THRESHOLDS.improvement
    ) {
        return "UP";
    }

    if (
        change <= TREND_THRESHOLDS.regression
    ) {
        return "DOWN";
    }

    return "STABLE";
};

const determineRepositoryDirection = (
    change: number | null
): RepositoryTrendDirection => {
    if (change === null) {
        return "INSUFFICIENT_DATA";
    }

    if (
        change >=
        REPOSITORY_DIRECTION.IMPROVING
    ) {
        return "IMPROVING";
    }

    if (
        change <=
        REPOSITORY_DIRECTION.DECLINING
    ) {
        return "DECLINING";
    }

    return "STABLE";
};

const calculateMetricTrend = (
    current: number,
    previous: number | null
): HealthMetricTrend => {
    if (previous === null) {
        return {
            current,

            previous: null,

            change: null,

            percentageChange: null,

            direction:
                "INSUFFICIENT_DATA",

            status:
                "INSUFFICIENT_DATA",
        };
    }

    const change =
        current - previous;

    return {
        current,

        previous,

        change,

        percentageChange:
            previous === 0
                ? null
                : Number(
                    (
                        (change / previous) *
                        100
                    ).toFixed(2)
                ),

        direction:
            determineTrendDirection(
                change
            ),

        status:
            determineRepositoryDirection(
                change
            ),
    };
};

const classifyRisk = (
    score: number
): RiskLevel => {
    return (
        RISK_LEVELS.find(
            (risk) =>
                score >= risk.minimum
        )?.level ?? "LOW"
    );
};

const buildHistory = (
    snapshots: SnapshotPair[]
): RepositoryHealthHistoryPoint[] => {
    return snapshots.map((snapshot) => ({
        snapshotId:
            snapshot.intelligence.id,

        advisorSnapshotId:
            snapshot.advisor?.id ?? null,

        recordedAt:
            snapshot.intelligence.createdAt,

        architecture:
            safe(
                snapshot.intelligence
                    .architectureScore
            ),

        engineeringQuality:
            safe(
                snapshot.intelligence
                    .engineeringQualityScore
            ),

        productionReadiness:
            safe(
                snapshot.intelligence
                    .productionReadinessScore
            ),

        capability:
            safe(
                snapshot.intelligence
                    .capabilityScore
            ),

        maturity:
            safe(
                snapshot.intelligence
                    .maturityScore
            ),

        confidence:
            snapshot.advisor
                ?.confidenceScore ??
            safe(
                snapshot.intelligence
                    .confidenceScore
            ),

        risk:
            snapshot.advisor
                ?.overallRiskScore ?? 0,

        health:
            calculateHealthScore(
                snapshot
            ),
    }));
};

const latest = <T>(
    values: T[]
): T | null =>
    values.length
        ? values[values.length - 1]
        : null;

const previous = <T>(
    values: T[]
): T | null =>
    values.length >= 2
        ? values[values.length - 2]
        : null;

/*
|--------------------------------------------------------------------------
| Load Repository Timeline
|--------------------------------------------------------------------------
|
| Repository Health Trends are built by pairing every Repository
| Intelligence Snapshot with the closest Architecture Advisor Snapshot
| that existed at that point in time.
|
| The snapshots themselves remain immutable.
|--------------------------------------------------------------------------
*/

const loadRepositoryHistory = async (
    repositoryId: string
): Promise<SnapshotPair[] | null> => {
    const repository =
        await prisma.repository.findUnique({
            where: {
                id: repositoryId,
            },

            select: {
                id: true,

                name: true,

                fullName: true,

                intelligenceSnapshots: {
                    orderBy: {
                        createdAt: "asc",
                    },

                    take: HISTORY.maximumSnapshots,

                    select: {
                        id: true,

                        createdAt: true,

                        architectureScore: true,

                        engineeringQualityScore: true,

                        productionReadinessScore: true,

                        capabilityScore: true,

                        maturityScore: true,

                        confidenceScore: true,
                    },
                },

                architectureAdvisorSnapshots: {
                    orderBy: {
                        generatedAt: "asc",
                    },

                    select: {
                        id: true,

                        overallRiskScore: true,

                        confidenceScore: true,

                        generatedAt: true,

                        sourceIntelligenceSnapshotId: true,
                    },
                },
            },
        });

    if (!repository) {
        return null;
    }

    return repository.intelligenceSnapshots.map(
        (snapshot) => {
            /*
             * Find the newest advisor snapshot that existed when this
             * intelligence snapshot was generated.
             */

            const advisor =
                repository.architectureAdvisorSnapshots.find(
                    (candidate) =>
                        candidate.sourceIntelligenceSnapshotId ===
                        snapshot.id
                ) ?? null;

            return {
                intelligence: snapshot,

                advisor,
            };
        }
    );
};

const buildChanges = (
    history: RepositoryHealthHistoryPoint[]
): RepositoryHealthChange[] => {
    const changes: RepositoryHealthChange[] =
        [];

    for (
        let index = 1;
        index < history.length;
        index++
    ) {
        const previous =
            history[index - 1];

        const current =
            history[index];

        const metrics = [
            {
                metric: "ARCHITECTURE",
                previous:
                    previous.architecture,
                current:
                    current.architecture,
            },

            {
                metric:
                    "ENGINEERING_QUALITY",
                previous:
                    previous.engineeringQuality,
                current:
                    current.engineeringQuality,
            },

            {
                metric:
                    "PRODUCTION_READINESS",
                previous:
                    previous.productionReadiness,
                current:
                    current.productionReadiness,
            },

            {
                metric: "CAPABILITY",
                previous:
                    previous.capability,
                current:
                    current.capability,
            },

            {
                metric: "MATURITY",
                previous:
                    previous.maturity,
                current:
                    current.maturity,
            },

            {
                metric: "CONFIDENCE",
                previous:
                    previous.confidence,
                current:
                    current.confidence,
            },

            {
                metric: "RISK",
                previous:
                    previous.risk,
                current:
                    current.risk,
            },

            {
                metric: "HEALTH",
                previous:
                    previous.health,
                current:
                    current.health,
            },
        ] as const;

        for (const metric of metrics) {
            const difference =
                metric.current -
                metric.previous;

            if (
                Math.abs(difference) <
                TREND_THRESHOLDS.stableTolerance
            ) {
                continue;
            }

            changes.push({
                recordedAt:
                    current.recordedAt,

                metric:
                    metric.metric,

                previous:
                    metric.previous,

                current:
                    metric.current,

                difference,

                direction:
                    determineTrendDirection(
                        difference
                    ),

                summary:
                    difference > 0
                        ? `${metric.metric} improved by ${difference} point${Math.abs(difference) === 1
                            ? ""
                            : "s"
                        }.`
                        : `${metric.metric} declined by ${Math.abs(
                            difference
                        )} point${Math.abs(difference) === 1
                            ? ""
                            : "s"
                        }.`,
            });
        }
    }

    return changes.sort(
        (a, b) =>
            b.recordedAt.getTime() -
            a.recordedAt.getTime()
    );
};

const buildSummary = (
    history: RepositoryHealthHistoryPoint[]
): RepositoryHealthSummary => {
    const newest =
        latest(history);

    const older =
        previous(history);

    const healthChange =
        newest && older
            ? newest.health -
            older.health
            : null;

    return {
        direction:
            determineRepositoryDirection(
                healthChange
            ),

        healthScore:
            newest?.health ?? 0,

        previousHealthScore:
            older?.health ?? null,

        healthScoreChange:
            healthChange,

        maturity:
            newest
                ? newest.maturity >= 85
                    ? "ADVANCED"
                    : newest.maturity >= 70
                        ? "MATURE"
                        : newest.maturity >= 50
                            ? "DEVELOPING"
                            : "EMERGING"
                : "UNKNOWN",

        riskLevel:
            classifyRisk(
                newest?.risk ?? 0
            ),

        confidenceScore:
            newest?.confidence ?? 0,

        snapshotCount:
            history.length,

        firstRecordedAt:
            history[0]?.recordedAt ??
            null,

        lastRecordedAt:
            newest?.recordedAt ??
            null,
    };
};

/*
|--------------------------------------------------------------------------
| Latest Score Card
|--------------------------------------------------------------------------
|
| The frontend dashboard needs the most recent scores without having to
| inspect the history array.
|--------------------------------------------------------------------------
*/

const buildLatestScores = (
    history: RepositoryHealthHistoryPoint[]
): RepositoryLatestScores => {
    const latestSnapshot = latest(history);

    if (!latestSnapshot) {
        return {
            architecture: 0,
            engineeringQuality: 0,
            productionReadiness: 0,
            capability: 0,
            maturity: 0,
            confidence: 0,
            risk: 0,
            health: 0,
        };
    }

    return {
        architecture: latestSnapshot.architecture,

        engineeringQuality:
            latestSnapshot.engineeringQuality,

        productionReadiness:
            latestSnapshot.productionReadiness,

        capability:
            latestSnapshot.capability,

        maturity:
            latestSnapshot.maturity,

        confidence:
            latestSnapshot.confidence,

        risk:
            latestSnapshot.risk,

        health:
            latestSnapshot.health,
    };
};

/*
|--------------------------------------------------------------------------
| Trend Comparison
|--------------------------------------------------------------------------
*/

const buildTrendComparison = (
    history: RepositoryHealthHistoryPoint[]
): RepositoryHealthTrends => {
    const current = latest(history);

    const previousSnapshot =
        previous(history);

    if (!current) {
        const empty = calculateMetricTrend(
            0,
            null
        );

        return {
            architecture: empty,
            engineeringQuality: empty,
            productionReadiness: empty,
            capability: empty,
            maturity: empty,
            confidence: empty,
            risk: empty,
            health: empty,
        };
    }

    return {
        architecture: calculateMetricTrend(
            current.architecture,
            previousSnapshot?.architecture ??
            null
        ),

        engineeringQuality:
            calculateMetricTrend(
                current.engineeringQuality,
                previousSnapshot
                    ?.engineeringQuality ?? null
            ),

        productionReadiness:
            calculateMetricTrend(
                current.productionReadiness,
                previousSnapshot
                    ?.productionReadiness ??
                null
            ),

        capability:
            calculateMetricTrend(
                current.capability,
                previousSnapshot
                    ?.capability ?? null
            ),

        maturity:
            calculateMetricTrend(
                current.maturity,
                previousSnapshot?.maturity ??
                null
            ),

        confidence:
            calculateMetricTrend(
                current.confidence,
                previousSnapshot
                    ?.confidence ?? null
            ),

        risk:
            calculateMetricTrend(
                current.risk,
                previousSnapshot?.risk ??
                null
            ),

        health:
            calculateMetricTrend(
                current.health,
                previousSnapshot?.health ??
                null
            ),
    };
};

/*
|--------------------------------------------------------------------------
| Engineering Insights
|--------------------------------------------------------------------------
*/

const buildInsights = (
    summary: RepositoryHealthSummary,
    changes: RepositoryHealthChange[]
): string[] => {
    const insights: string[] = [];

    switch (summary.direction) {
        case "IMPROVING":
            insights.push(
                "Repository health is improving compared with the previous intelligence snapshot."
            );
            break;

        case "DECLINING":
            insights.push(
                "Repository health has declined since the previous assessment."
            );
            break;

        case "STABLE":
            insights.push(
                "Repository health is currently stable."
            );
            break;

        default:
            insights.push(
                "More historical snapshots are required before meaningful trend analysis can be produced."
            );
    }

    const improvements =
        changes.filter(
            (change) =>
                change.direction === "UP"
        ).length;

    const regressions =
        changes.filter(
            (change) =>
                change.direction === "DOWN"
        ).length;

    if (
        improvements >
        regressions
    ) {
        insights.push(
            "Recent engineering work has resulted in more improvements than regressions."
        );
    }

    if (
        regressions >
        improvements
    ) {
        insights.push(
            "Recent engineering history shows more regressions than improvements."
        );
    }

    if (
        summary.riskLevel ===
        "CRITICAL"
    ) {
        insights.push(
            "The repository currently carries a critical engineering risk profile."
        );
    }

    if (
        summary.confidenceScore <
        50
    ) {
        insights.push(
            "Confidence is limited because ArcHive has insufficient historical evidence."
        );
    }

    return insights;
};

export const healthTrendsService = {
    async getRepositoryHealth(
        repositoryId: string
    ): Promise<RepositoryHealthResponse | null> {
        const snapshots =
            await loadRepositoryHistory(
                repositoryId
            );

        if (!snapshots) {
            return null;
        }

        const history =
            buildHistory(snapshots);

        const summary =
            buildSummary(history);

        const latestScores =
            buildLatestScores(history);

        const trends =
            buildTrendComparison(
                history
            );

        const changes =
            buildChanges(history);

        const insights =
            buildInsights(
                summary,
                changes
            );

        const repository =
            await prisma.repository.findUnique({
                where: {
                    id: repositoryId,
                },

                select: {
                    id: true,
                    name: true,
                    fullName: true,
                },
            });

        if (!repository) {
            return null;
        }

        return {
            repository,

            summary,

            latestScores,

            trends,

            history,

            changes,

            insights,

            generatedAt:
                new Date(),
        };
    },

    async getHealthSummary(
        repositoryId: string
    ) {
        const health =
            await this.getRepositoryHealth(
                repositoryId
            );

        return health?.summary ?? null;
    },

    async getHistory(
        repositoryId: string
    ) {
        const health =
            await this.getRepositoryHealth(
                repositoryId
            );

        return health?.history ?? null;
    },

    async getChanges(
        repositoryId: string
    ) {
        const health =
            await this.getRepositoryHealth(
                repositoryId
            );

        return health?.changes ?? null;
    },

    /*
     * Repository Health is derived from immutable snapshots.
     *
     * Refreshing simply rebuilds the analytics from the latest evidence.
     * No additional database rows are written.
     */
    async refresh(
        repositoryId: string
    ) {
        return this.getRepositoryHealth(
            repositoryId
        );
    },
};