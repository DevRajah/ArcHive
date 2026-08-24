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

import {
    hasSufficientAdvisorRiskEvidence,
} from "./organization/organization.utils";

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

        evidenceSummary: unknown;
    } | null;
};

const clamp = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

const safe = (value: number | null | undefined) =>
    value ?? 0;
/**
 * Preserves the difference between:
 *
 * 0    = ArcHive measured the metric and the score is genuinely zero.
 * null = ArcHive does not have a score for this metric.
 */
const preserveScore = (
    value: number | null | undefined
): number | null => {
    return value ?? null;
};

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
): number | null => {
    const architecture =
        preserveScore(
            snapshot.intelligence.architectureScore
        );

    const engineering =
        preserveScore(
            snapshot.intelligence
                .engineeringQualityScore
        );

    const production =
        preserveScore(
            snapshot.intelligence
                .productionReadinessScore
        );

    const capability =
        preserveScore(
            snapshot.intelligence.capabilityScore
        );

    const maturity =
        preserveScore(
            snapshot.intelligence.maturityScore
        );

    const confidence =
        snapshot.advisor?.confidenceScore ??
        preserveScore(
            snapshot.intelligence.confidenceScore
        );

    const advisorRiskIsAssessable =
        snapshot.advisor !== null &&
        hasSufficientAdvisorRiskEvidence(
            snapshot.advisor.evidenceSummary
        );

    const risk =
        advisorRiskIsAssessable
            ? snapshot.advisor!.overallRiskScore
            : null;

    /*
     * Missing evidence must not behave like a zero score.
     *
     * Instead, only metrics that ArcHive genuinely knows participate
     * in the composite health score.
     */
    const weightedMetrics: Array<{
        value: number | null;
        weight: number;
    }> = [
            {
                value: architecture,
                weight:
                    HEALTH_SCORE_WEIGHTS.architecture,
            },
            {
                value: engineering,
                weight:
                    HEALTH_SCORE_WEIGHTS
                        .engineeringQuality,
            },
            {
                value: production,
                weight:
                    HEALTH_SCORE_WEIGHTS
                        .productionReadiness,
            },
            {
                value: capability,
                weight:
                    HEALTH_SCORE_WEIGHTS.capability,
            },
            {
                value: maturity,
                weight:
                    HEALTH_SCORE_WEIGHTS.maturity,
            },
            {
                value: confidence,
                weight:
                    HEALTH_SCORE_WEIGHTS.confidence,
            },
            {
                // Risk is inverted because lower risk means
                // better repository health.
                value:
                    risk === null
                        ? null
                        : 100 - risk,
                weight:
                    HEALTH_SCORE_WEIGHTS.risk,
            },
        ];

    let weightedTotal = 0;
    let availableWeight = 0;

    for (const metric of weightedMetrics) {
        if (metric.value === null) {
            continue;
        }

        weightedTotal +=
            metric.value * metric.weight;

        availableWeight += metric.weight;
    }

    /*
     * No known metrics means there is no defensible health score.
     */
    if (availableWeight === 0) {
        return null;
    }

    /*
     * Re-normalize around the evidence that actually exists.
     *
     * Example:
     *
     * weightedTotal = 24
     * availableWeight = 0.30
     *
     * health = 24 / 0.30 = 80
     */
    return clamp(
        weightedTotal / availableWeight
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
    current: number | null,
    previous: number | null
): HealthMetricTrend => {
    /*
     * A trend cannot exist unless the current measurement exists.
     */
    if (current === null) {
        return {
            current: null,

            previous,

            change: null,

            percentageChange: null,

            direction:
                "INSUFFICIENT_DATA",

            status:
                "INSUFFICIENT_DATA",
        };
    }

    /*
     * We have a current value but nothing historical to compare it with.
     */
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
    return snapshots.map((snapshot) => {
        const advisorRiskIsAssessable =
            snapshot.advisor !== null &&
            hasSufficientAdvisorRiskEvidence(
                snapshot.advisor.evidenceSummary
            );

        return {
            snapshotId:
                snapshot.intelligence.id,

            advisorSnapshotId:
                snapshot.advisor?.id ?? null,

            recordedAt:
                snapshot.intelligence.createdAt,

            architecture:
                preserveScore(
                    snapshot.intelligence
                        .architectureScore
                ),

            engineeringQuality:
                preserveScore(
                    snapshot.intelligence
                        .engineeringQualityScore
                ),

            productionReadiness:
                preserveScore(
                    snapshot.intelligence
                        .productionReadinessScore
                ),

            capability:
                preserveScore(
                    snapshot.intelligence
                        .capabilityScore
                ),

            maturity:
                preserveScore(
                    snapshot.intelligence
                        .maturityScore
                ),

            confidence:
                snapshot.advisor
                    ?.confidenceScore ??
                preserveScore(
                    snapshot.intelligence
                        .confidenceScore
                ),

            risk:
                advisorRiskIsAssessable
                    ? snapshot.advisor!
                        .overallRiskScore
                    : null,

            health:
                calculateHealthScore(
                    snapshot
                ),
        };
    });
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
                        createdAt: "desc",
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

                        evidenceSummary: true,
                    },
                },
            },
        });

    if (!repository) {
        return null;
    }

    // Prisma returned the newest snapshots first.
    // I Reverse them so trend calculations still run from oldest to newest.
    return [...repository.intelligenceSnapshots]
        .reverse()
        .map((snapshot) => {
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

            /*
 * A change is only meaningful when both measurements exist.
 *
 * Missing evidence is not a zero score and therefore must not
 * generate an artificial improvement or regression.
 */
            if (
                metric.previous === null ||
                metric.current === null
            ) {
                continue;
            }
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
        newest?.health !== null &&
            newest?.health !== undefined &&
            older?.health !== null &&
            older?.health !== undefined
            ? newest.health -
            older.health
            : null;

    return {
        direction:
            determineRepositoryDirection(
                healthChange
            ),

        healthScore:
            newest?.health ?? null,

        previousHealthScore:
            older?.health ?? null,

        healthScoreChange:
            healthChange,

        maturity:
            newest?.maturity == null
                ? "UNKNOWN"
                : newest.maturity >= 85
                    ? "ADVANCED"
                    : newest.maturity >= 70
                        ? "MATURE"
                        : newest.maturity >= 50
                            ? "DEVELOPING"
                            : "EMERGING",

        riskLevel:
            newest?.risk == null
                ? "UNASSESSED"
                : classifyRisk(
                    newest.risk
                ),

        confidenceScore:
            newest?.confidence ?? null,

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
            architecture: null,
            engineeringQuality: null,
            productionReadiness: null,
            capability: null,
            maturity: null,
            confidence: null,
            risk: null,
            health: null,
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
            null,
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
        summary.confidenceScore !== null &&
        summary.confidenceScore < 50
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