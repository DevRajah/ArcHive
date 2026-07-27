import {
    OrganizationQueryOptions,
    OrganizationRepositoryScore,
} from "../../types/organization.types";

import {
    latestAdvisor,
    latestSnapshot,
    loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Builds a scorecard for every tracked repository.
 *
 * The frontend uses this endpoint to display the strongest
 * and weakest repositories across an organisation.
 */
export const getRepositoryRankings = async (
    options: OrganizationQueryOptions,
): Promise<OrganizationRepositoryScore[]> => {
    const repositories = await loadOrganizationRepositories(
        options.userId,
    );

    const rankings: OrganizationRepositoryScore[] = [];

    for (const repository of repositories) {
        const snapshot = latestSnapshot(repository);
        const advisor = latestAdvisor(repository);

        /**
         * Has this repository been analysed yet?
         */
        const hasAnalysis = snapshot !== null;

        const architectureScore =
            snapshot?.architectureScore ?? null;

        const engineeringScore =
            snapshot?.engineeringQualityScore ?? null;

        const productionScore =
            snapshot?.productionReadinessScore ?? null;

        const maturityScore =
            snapshot?.maturityScore ?? null;

        const confidenceScore =
            snapshot?.confidenceScore ?? null;

        const riskScore =
            advisor?.overallRiskScore ?? null;

        /**
         * Overall score is simply the average of the
         * positive engineering metrics.
         *
         * Risk is kept separate because a repository
         * may have good engineering quality while still
         * carrying architectural risk.
         */

        /**
   * Build a list of every score that actually exists.
   *
   * We intentionally ignore null values because
   * a repository shouldn't be penalised simply because
   * one metric hasn't been calculated yet.
   */
        const availableScores = [
            architectureScore,
            engineeringScore,
            productionScore,
            maturityScore,
            confidenceScore,
        ].filter(
            (score): score is number => score !== null,
        );

        /**
         * Overall score represents the average of every
         * available engineering metric.
         */
        const overallScore =
            availableScores.length > 0
                ? Number(
                    (
                        availableScores.reduce(
                            (total, score) => total + score,
                            0,
                        ) / availableScores.length
                    ).toFixed(1),
                )
                : null;

        rankings.push({
            repositoryId: repository.id,

            repositoryName: repository.name,

            repositoryFullName: repository.fullName,

            language: repository.language,

            analysisStatus: hasAnalysis
                ? "COMPLETED"
                : "PENDING",

            architectureScore,

            engineeringQualityScore: engineeringScore,

            productionReadinessScore: productionScore,

            maturityScore,

            confidenceScore,

            riskScore,

            overallScore,

            recommendationCount:
                repository.engineeringRecommendations.filter(
                    (recommendation) =>
                        recommendation.status === "ACTIVE",
                ).length,

            architectureChangeCount:
                repository.architectureChanges.length,

            engineeringEventCount:
                repository.events.length,
        });
    }

    /**
     * Highest scoring repositories appear first.
     */
    rankings.sort((left, right) => {
        if (left.overallScore === null) {
            return 1;
        }

        if (right.overallScore === null) {
            return -1;
        }

        return right.overallScore - left.overallScore;
    });

    return rankings;
};