import { TeamMemberRole } from "@prisma/client";
import { prisma } from "@archive/database";

import type {
    TeamDashboard,
    TeamRecommendation,
    TeamRepositoryRanking,
    TeamRepositoryRisk,
    TeamRiskLevel,
    TeamTechnologyInventory,
    TeamTechnologyItem,
} from "../../types/team-dashboard.types";

import {
    TeamNotFoundError,
} from "./team-permission.service";

const calculateAverage = (
    values: Array<number | null | undefined>,
): number => {
    const validValues = values.filter(
        (value): value is number =>
            value !== null &&
            value !== undefined,
    );

    if (validValues.length === 0) {
        return 0;
    }

    return Math.round(
        validValues.reduce(
            (total, value) => total + value,
            0,
        ) / validValues.length,
    );
};

const calculateOverallScore = (
    values: Array<number | null | undefined>,
): number | null => {
    const validValues = values.filter(
        (value): value is number =>
            value !== null &&
            value !== undefined,
    );

    if (validValues.length === 0) {
        return null;
    }

    return Number(
        (
            validValues.reduce(
                (total, value) => total + value,
                0,
            ) / validValues.length
        ).toFixed(1),
    );
};

const resolveRiskLevel = (
    score: number,
): TeamRiskLevel => {
    if (score >= 80) {
        return "CRITICAL";
    }

    if (score >= 60) {
        return "HIGH";
    }

    if (score >= 30) {
        return "MEDIUM";
    }

    return "LOW";
};

const extractTechnologyName = (
    value: unknown,
): string | null => {
    if (typeof value === "string") {
        return value.trim() || null;
    }

    if (
        value &&
        typeof value === "object" &&
        "name" in value &&
        typeof value.name === "string"
    ) {
        return value.name.trim() || null;
    }

    return null;
};

export const getTeamDashboard = async ({
    teamId,
}: {
    teamId: string;
}): Promise<TeamDashboard> => {
    const team = await prisma.team.findUnique({
        where: {
            id: teamId,
        },

        include: {
            members: true,

            repositories: {
                include: {
                    addedBy: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },

                    repository: {
                        include: {
                            intelligenceSnapshots: {
                                orderBy: {
                                    createdAt: "desc",
                                },

                                take: 1,
                            },

                            architectureAdvisorSnapshots: {
                                orderBy: {
                                    generatedAt: "desc",
                                },

                                take: 1,
                            },

                            engineeringRecommendations: {
                                where: {
                                    status: "ACTIVE",
                                },

                                orderBy: {
                                    createdAt: "desc",
                                },
                            },

                            architectureChanges: {
                                select: {
                                    id: true,
                                },
                            },

                            events: {
                                select: {
                                    id: true,
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!team) {
        throw new TeamNotFoundError();
    }

    const trackedRepositories =
        team.repositories.filter(
            (item) =>
                item.repository.isTracked,
        );

    const latestSnapshots =
        team.repositories
            .map(
                (item) =>
                    item.repository
                        .intelligenceSnapshots[0],
            )
            .filter(
                (
                    snapshot,
                ): snapshot is NonNullable<
                    typeof snapshot
                > => Boolean(snapshot),
            );

    /*
     * Repository rankings
     *
     * Unanalysed repositories keep null scores rather than being represented
     * as zero. A zero is a real score, while null means no analysis exists.
     */
    const rankings: TeamRepositoryRanking[] =
        team.repositories
            .map((item) => {
                const repository =
                    item.repository;

                const snapshot =
                    repository
                        .intelligenceSnapshots[0] ??
                    null;

                const advisor =
                    repository
                        .architectureAdvisorSnapshots[0] ??
                    null;

                const overallScore = snapshot
                    ? calculateOverallScore([
                        snapshot.architectureScore,
                        snapshot.engineeringQualityScore,
                        snapshot.productionReadinessScore,
                        snapshot.capabilityScore,
                        snapshot.maturityScore,
                        snapshot.confidenceScore,
                    ])
                    : null;

                return {
                    repositoryId:
                        repository.id,

                    repositoryName:
                        repository.name,

                    repositoryFullName:
                        repository.fullName,

                    language:
                        repository.language,

                    analysisStatus: snapshot
                        ? ("COMPLETED" as const)
                        : ("PENDING" as const),

                    architectureScore:
                        snapshot?.architectureScore ??
                        null,

                    engineeringQualityScore:
                        snapshot
                            ?.engineeringQualityScore ??
                        null,

                    productionReadinessScore:
                        snapshot
                            ?.productionReadinessScore ??
                        null,

                    capabilityScore:
                        snapshot?.capabilityScore ??
                        null,

                    maturityScore:
                        snapshot?.maturityScore ??
                        null,

                    confidenceScore:
                        snapshot?.confidenceScore ??
                        null,

                    riskScore:
                        advisor?.overallRiskScore ??
                        null,

                    overallScore,

                    recommendationCount:
                        repository
                            .engineeringRecommendations
                            .length,

                    architectureChangeCount:
                        repository
                            .architectureChanges
                            .length,

                    engineeringEventCount:
                        repository.events.length,
                };
            })
            .sort((left, right) => {
                if (
                    left.overallScore === null &&
                    right.overallScore === null
                ) {
                    return left.repositoryName.localeCompare(
                        right.repositoryName,
                    );
                }

                if (left.overallScore === null) {
                    return 1;
                }

                if (right.overallScore === null) {
                    return -1;
                }

                return (
                    right.overallScore -
                    left.overallScore
                );
            });

    /*
     * Technology inventory
     */
    const technologyMap =
        new Map<
            string,
            TeamTechnologyItem
        >();

    for (const item of team.repositories) {
        const repository =
            item.repository;

        const snapshot =
            repository
                .intelligenceSnapshots[0];

        const addTechnology = (
            technologyName: string,
        ) => {
            const name =
                technologyName.trim();

            if (!name) {
                return;
            }

            const existing =
                technologyMap.get(name);

            const repositoryReference = {
                repositoryId:
                    repository.id,

                repositoryName:
                    repository.name,

                repositoryFullName:
                    repository.fullName,
            };

            if (existing) {
                const alreadyIncluded =
                    existing.repositories.some(
                        (entry) =>
                            entry.repositoryId ===
                            repository.id,
                    );

                if (!alreadyIncluded) {
                    existing.repositoryCount += 1;

                    existing.repositories.push(
                        repositoryReference,
                    );
                }

                return;
            }

            technologyMap.set(name, {
                technology: name,
                repositoryCount: 1,
                repositories: [
                    repositoryReference,
                ],
            });
        };

        if (repository.language) {
            addTechnology(
                repository.language,
            );
        }

        if (
            !snapshot ||
            !Array.isArray(
                snapshot.technologies,
            )
        ) {
            continue;
        }

        for (
            const technology of
            snapshot.technologies
        ) {
            const name =
                extractTechnologyName(
                    technology,
                );

            if (name) {
                addTechnology(name);
            }
        }
    }

    const technologyItems =
        Array.from(
            technologyMap.values(),
        ).sort(
            (left, right) =>
                right.repositoryCount -
                left.repositoryCount,
        );

    const technology:
        TeamTechnologyInventory = {
        totalTechnologies:
            technologyItems.length,

        technologies:
            technologyItems,
    };

    /*
     * Team risks
     */
    const riskRepositories:
        TeamRepositoryRisk[] =
        team.repositories
            .map((item) => {
                const repository =
                    item.repository;

                const advisor =
                    repository
                        .architectureAdvisorSnapshots[0];

                if (!advisor) {
                    return null;
                }

                return {
                    repositoryId:
                        repository.id,

                    repositoryName:
                        repository.name,

                    repositoryFullName:
                        repository.fullName,

                    overallRiskScore:
                        advisor.overallRiskScore,

                    overallAssessment:
                        advisor.overallAssessment,

                    maturityLabel:
                        advisor.maturityLabel,

                    riskLevel:
                        resolveRiskLevel(
                            advisor.overallRiskScore,
                        ),

                    generatedAt:
                        advisor.generatedAt,
                };
            })
            .filter(
                (
                    risk,
                ): risk is TeamRepositoryRisk =>
                    risk !== null,
            )
            .sort(
                (left, right) =>
                    right.overallRiskScore -
                    left.overallRiskScore,
            );

    const risks = {
        totalRepositories:
            riskRepositories.length,

        criticalRepositories:
            riskRepositories.filter(
                (risk) =>
                    risk.riskLevel ===
                    "CRITICAL",
            ).length,

        highRiskRepositories:
            riskRepositories.filter(
                (risk) =>
                    risk.riskLevel === "HIGH",
            ).length,

        mediumRiskRepositories:
            riskRepositories.filter(
                (risk) =>
                    risk.riskLevel ===
                    "MEDIUM",
            ).length,

        lowRiskRepositories:
            riskRepositories.filter(
                (risk) =>
                    risk.riskLevel === "LOW",
            ).length,

        repositories:
            riskRepositories,
    };

    /*
     * Active recommendations across every repository currently attached
     * to this team.
     */
    const recommendations:
        TeamRecommendation[] =
        team.repositories
            .flatMap((item) => {
                const repository =
                    item.repository;

                return repository
                    .engineeringRecommendations
                    .map(
                        (
                            recommendation,
                        ): TeamRecommendation => ({
                            id:
                                recommendation.id,

                            repositoryId:
                                repository.id,

                            repositoryName:
                                repository.name,

                            repositoryFullName:
                                repository.fullName,

                            recommendationKey:
                                recommendation
                                    .recommendationKey,

                            title:
                                recommendation.title,

                            description:
                                recommendation
                                    .description,

                            status:
                                recommendation.status,

                            evidence:
                                recommendation.evidence,

                            createdAt:
                                recommendation.createdAt,

                            updatedAt:
                                recommendation.updatedAt,
                        }),
                    );
            })
            .sort(
                (left, right) =>
                    right.createdAt.getTime() -
                    left.createdAt.getTime(),
            );

    const latestAnalysis =
        latestSnapshots
            .map(
                (snapshot) =>
                    snapshot.createdAt,
            )
            .sort(
                (left, right) =>
                    right.getTime() -
                    left.getTime(),
            )[0] ?? null;

    return {
        team: {
            id: team.id,
            name: team.name,
            slug: team.slug,
            description:
                team.description,
        },

        members: {
            total:
                team.members.length,

            owners:
                team.members.filter(
                    (member) =>
                        member.role ===
                        TeamMemberRole.OWNER,
                ).length,

            admins:
                team.members.filter(
                    (member) =>
                        member.role ===
                        TeamMemberRole.ADMIN,
                ).length,

            members:
                team.members.filter(
                    (member) =>
                        member.role ===
                        TeamMemberRole.MEMBER,
                ).length,

            viewers:
                team.members.filter(
                    (member) =>
                        member.role ===
                        TeamMemberRole.VIEWER,
                ).length,
        },

        repositories: {
            total:
                team.repositories.length,

            tracked:
                trackedRepositories.length,

            untracked:
                team.repositories.length -
                trackedRepositories.length,
        },

        engineering: {
            averageArchitecture:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .architectureScore,
                    ),
                ),

            averageEngineeringQuality:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .engineeringQualityScore,
                    ),
                ),

            averageProductionReadiness:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .productionReadinessScore,
                    ),
                ),

            averageCapability:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .capabilityScore,
                    ),
                ),

            averageMaturity:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .maturityScore,
                    ),
                ),

            averageConfidence:
                calculateAverage(
                    latestSnapshots.map(
                        (snapshot) =>
                            snapshot
                                .confidenceScore,
                    ),
                ),

            repositoryCoverage:
                team.repositories.length === 0
                    ? 0
                    : Number(
                        (
                            (latestSnapshots.length /
                                team.repositories
                                    .length) *
                            100
                        ).toFixed(1),
                    ),

            lastAnalysisAt:
                latestAnalysis,
        },

        rankings,

        technology,

        risks,

        recommendations,
    };
};