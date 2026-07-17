import { prisma } from "@archive/database";

import {
  buildSnapshotComparison,
  hasMeaningfulComparisonChanges,
  readCapabilitiesFromJson,
  readRecommendationsFromJson,
  readStringArrayFromJson,
} from "./intelligence-diff-comparison.service";

import type {
  IntelligenceDiffResponse,
  IntelligenceSignalChange,
} from "../types/intelligence-diff.types";

const emptySignalChange = (): IntelligenceSignalChange => ({
  added: [],
  removed: [],
  unchanged: [],
});

const createEmptyDiff = ({
  repository,
}: {
  repository: {
    id: string;
    name: string;
    fullName: string | null;
  };
}): IntelligenceDiffResponse => {
  return {
    repository,
    hasDiff: false,
    generatedAt: null,
    summary: null,
    scoreChanges: [],

    signalChanges: {
      technologies: emptySignalChange(),
      architectureDomains: emptySignalChange(),
      repositoryTypes: emptySignalChange(),
      capabilities: emptySignalChange(),
    },

    recommendationChanges: {
      added: [],
      resolved: [],
      removed: [],
    },
  };
};

const pluralize = (
  count: number,
  singular: string,
  plural = `${singular}s`
) => {
  return count === 1 ? singular : plural;
};

const buildDiffSummary = ({
  repositoryName,
  comparison,
}: {
  repositoryName: string;
  comparison: ReturnType<typeof buildSnapshotComparison>;
}) => {
  const addedSignals =
    comparison.signalChanges.technologies.added.length +
    comparison.signalChanges.architectureDomains.added.length +
    comparison.signalChanges.repositoryTypes.added.length +
    comparison.signalChanges.capabilities.added.length;

  const removedSignals =
    comparison.signalChanges.technologies.removed.length +
    comparison.signalChanges.architectureDomains.removed.length +
    comparison.signalChanges.repositoryTypes.removed.length +
    comparison.signalChanges.capabilities.removed.length;

  const increasedScores = comparison.scoreChanges.filter(
    (change) => change.direction === "UP"
  ).length;

  const decreasedScores = comparison.scoreChanges.filter(
    (change) => change.direction === "DOWN"
  ).length;

  const meaningfulChanges =
    hasMeaningfulComparisonChanges(comparison);

  if (!meaningfulChanges) {
    return {
      headline: "No meaningful intelligence changes detected",
      description: `ArcHive's understanding of ${repositoryName} remained stable between the two most recent intelligence snapshots.`,
    };
  }

  const changeDescriptions: string[] = [];

  if (addedSignals > 0) {
    changeDescriptions.push(
      `${addedSignals} new ${pluralize(
        addedSignals,
        "signal"
      )} detected`
    );
  }

  if (removedSignals > 0) {
    changeDescriptions.push(
      `${removedSignals} ${pluralize(
        removedSignals,
        "signal"
      )} no longer detected`
    );
  }

  if (increasedScores > 0) {
    changeDescriptions.push(
      `${increasedScores} ${pluralize(
        increasedScores,
        "score"
      )} improved`
    );
  }

  if (decreasedScores > 0) {
    changeDescriptions.push(
      `${decreasedScores} ${pluralize(
        decreasedScores,
        "score"
      )} declined`
    );
  }

  if (comparison.recommendationChanges.added.length > 0) {
    const count =
      comparison.recommendationChanges.added.length;

    changeDescriptions.push(
      `${count} new ${pluralize(count, "recommendation")}`
    );
  }

  if (
    comparison.recommendationChanges.resolved.length > 0
  ) {
    const count =
      comparison.recommendationChanges.resolved.length;

    changeDescriptions.push(
      `${count} ${pluralize(
        count,
        "recommendation"
      )} resolved`
    );
  }

  return {
    headline: `${repositoryName} intelligence has evolved`,
    description:
      changeDescriptions.length > 0
        ? `${changeDescriptions.join(
            ", "
          )} between the latest two intelligence refreshes.`
        : `ArcHive detected a change in its understanding of ${repositoryName}.`,
  };
};

export const intelligenceDiffService = {
  async getRepositoryDiff(
    repositoryId: string
  ): Promise<IntelligenceDiffResponse | null> {
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

    /*
     * Snapshots are only written after intelligence generation succeeds.
     * Therefore, every persisted snapshot represents a completed refresh.
     */
    const snapshots =
      await prisma.repositoryIntelligenceSnapshot.findMany({
        where: {
          repositoryId,
        },
        orderBy: [
          {
            createdAt: "desc",
          },
          {
            id: "desc",
          },
        ],
        take: 2,
        select: {
          id: true,
          repositoryTypes: true,
          technologies: true,
          architectureDomains: true,
          capabilities: true,
          recommendations: true,
          confidenceScore: true,
          maturityScore: true,
          architectureScore: true,
          capabilityScore: true,
          engineeringQualityScore: true,
          productionReadinessScore: true,
          createdAt: true,
        },
      });

    if (snapshots.length < 2) {
      return createEmptyDiff({
        repository,
      });
    }

    const [currentSnapshot, previousSnapshot] = snapshots;

    const previous = {
      repositoryTypes: readStringArrayFromJson(
        previousSnapshot.repositoryTypes
      ),

      technologies: readStringArrayFromJson(
        previousSnapshot.technologies
      ),

      architectureDomains: readStringArrayFromJson(
        previousSnapshot.architectureDomains
      ),

      capabilities: readCapabilitiesFromJson(
        previousSnapshot.capabilities
      ),

      recommendations: readRecommendationsFromJson(
        previousSnapshot.recommendations
      ),

      confidenceScore: previousSnapshot.confidenceScore,
      maturityScore: previousSnapshot.maturityScore,
      architectureScore: previousSnapshot.architectureScore,
      capabilityScore: previousSnapshot.capabilityScore,
      engineeringQualityScore:
        previousSnapshot.engineeringQualityScore,
      productionReadinessScore:
        previousSnapshot.productionReadinessScore,
    };

    const current = {
      repositoryTypes: readStringArrayFromJson(
        currentSnapshot.repositoryTypes
      ),

      technologies: readStringArrayFromJson(
        currentSnapshot.technologies
      ),

      architectureDomains: readStringArrayFromJson(
        currentSnapshot.architectureDomains
      ),

      capabilities: readCapabilitiesFromJson(
        currentSnapshot.capabilities
      ),

      recommendations: readRecommendationsFromJson(
        currentSnapshot.recommendations
      ),

      confidenceScore: currentSnapshot.confidenceScore,
      maturityScore: currentSnapshot.maturityScore,
      architectureScore: currentSnapshot.architectureScore,
      capabilityScore: currentSnapshot.capabilityScore,
      engineeringQualityScore:
        currentSnapshot.engineeringQualityScore,
      productionReadinessScore:
        currentSnapshot.productionReadinessScore,
    };

    const comparison = buildSnapshotComparison({
      previous,
      current,
    });

    return {
      repository,
      hasDiff: true,
      generatedAt: currentSnapshot.createdAt.toISOString(),

      summary: buildDiffSummary({
        repositoryName: repository.name,
        comparison,
      }),

      scoreChanges: comparison.scoreChanges,
      signalChanges: comparison.signalChanges,
      recommendationChanges:
        comparison.recommendationChanges,
    };
  },
};