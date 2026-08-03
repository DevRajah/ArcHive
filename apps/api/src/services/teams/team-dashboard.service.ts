import { TeamMemberRole } from "@prisma/client";
import { prisma } from "@archive/database";

import { TeamDashboard } from "../../types/team-dashboard.types";

/**
 * Returns the high-level dashboard for a Team.
 *
 * Future me:
 * This intentionally uses only Team data.
 * Later we'll enrich it with Organization Intelligence
 * without changing the API contract.
 */
export const getTeamDashboard = async ({
    teamId,
}: {
    teamId: string;
}): Promise<TeamDashboard> => {
    const team = await prisma.team.findUnique({
        where: {
            id: teamId,
        },
    });

    if (!team) {
        throw new Error("Team not found.");
    }

    const members = await prisma.teamMember.findMany({
        where: {
            teamId,
        },
    });

    const repositories =
        await prisma.teamRepository.findMany({
            where: {
                teamId,
            },

            include: {
                repository: {
                    include: {
                        intelligenceSnapshots: {
                            orderBy: {
                                createdAt: "desc",
                            },

                            take: 1,
                        },
                    },
                },
            }
        });

    const trackedRepositories =
        repositories.filter(
            (repository) =>
                repository.repository.isTracked,
        );

    const snapshots = repositories
        .map(
            (repository) =>
                repository.repository
                    .intelligenceSnapshots[0],
        )
        .filter(Boolean);

    const average = (
        values: Array<number | null | undefined>,
    ) => {
        const valid = values.filter(
            (value): value is number =>
                value !== null &&
                value !== undefined,
        );

        if (valid.length === 0) {
            return 0;
        }

        return Math.round(
            valid.reduce(
                (total, value) =>
                    total + value,
                0,
            ) / valid.length,
        );
    };

    return {
        team: {
            id: team.id,
            name: team.name,
            slug: team.slug,
            description: team.description,
        },

        members: {
            total: members.length,

            owners: members.filter(
                (member) =>
                    member.role === TeamMemberRole.OWNER,
            ).length,

            admins: members.filter(
                (member) =>
                    member.role === TeamMemberRole.ADMIN,
            ).length,

            members: members.filter(
                (member) =>
                    member.role === TeamMemberRole.MEMBER,
            ).length,

            viewers: members.filter(
                (member) =>
                    member.role === TeamMemberRole.VIEWER,
            ).length,
        },

        repositories: {
            total: repositories.length,

            tracked: trackedRepositories.length,

            untracked:
                repositories.length -
                trackedRepositories.length,
        },

        engineering: {
            averageArchitecture: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.architectureScore,
                ),
            ),

            averageEngineeringQuality: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.engineeringQualityScore,
                ),
            ),

            averageProductionReadiness: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.productionReadinessScore,
                ),
            ),

            averageCapability: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.capabilityScore,
                ),
            ),

            averageMaturity: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.maturityScore,
                ),
            ),

            averageConfidence: average(
                snapshots.map(
                    (snapshot) =>
                        snapshot.confidenceScore,
                ),
            ),

            repositoryCoverage:
                repositories.length === 0
                    ? 0
                    : Math.round(
                        (snapshots.length /
                            repositories.length) *
                        100,
                    ),

            lastAnalysisAt:
                snapshots.length === 0
                    ? null
                    : snapshots
                        .sort(
                            (a, b) =>
                                b.createdAt.getTime() -
                                a.createdAt.getTime(),
                        )[0].createdAt,
        },
    };
};