import { prisma } from "@archive/database";
import { detectTechnologyFingerprint } from "@archive/detectors";

/*
 |--------------------------------------------------------------------------
 | Single source of truth for repository intelligence generation.
 |
 | Any current or future intelligence trigger should call this service:
 |
 | - GitHub webhook processors
 | - Manual single-repository reprocess
 | - Portfolio-wide reprocess
 | - Scheduled refresh jobs
 | - Future background workers
 |
 | This keeps ArcHive from having duplicated intelligence-generation logic.
 |--------------------------------------------------------------------------
 */

export const generateRepositoryIntelligence = async ({
  repositoryId,
}: {
  repositoryId: string;
}) => {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      architectureChanges: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const filesChanged = repository.architectureChanges
    .map((change) => change.fileAffected)
    .filter((file): file is string => Boolean(file));

  const commitMessages = [
    repository.name,
    repository.fullName,
    repository.description || "",
    repository.language || "",
    ...repository.architectureChanges.map((change) =>
      [
        change.changeType,
        change.detectedTechnology || "",
        change.summary,
        change.repositoryTypes || "",
        change.reasoningSignals || "",
        change.architectureDomain || "",
        change.evolutionSummary || "",
      ].join(" ")
    ),
  ].filter(Boolean);

  const fingerprint = detectTechnologyFingerprint(filesChanged, commitMessages);

  const repositoryIntelligence = fingerprint.repositoryIntelligence;

  const primaryRepositoryType =
    repositoryIntelligence.identity.repositoryTypes[0] ||
    fingerprint.repositoryTypes[0] ||
    "GENERAL_ENGINEERING_PROJECT";

  const primaryTechnology =
    repositoryIntelligence.signals.technologies[0] ||
    fingerprint.technologies[0] ||
    "Repository Intelligence";

  const primaryArchitectureDomain =
    repositoryIntelligence.signals.architectureDomains[0] ||
    fingerprint.architectureDomains[0] ||
    "GENERAL_ENGINEERING";

  const reasoningSignals =
    repositoryIntelligence.signals.reasoningSignals.length > 0
      ? repositoryIntelligence.signals.reasoningSignals
      : fingerprint.reasoningSignals;

  await prisma.$transaction(async (tx) => {
    // I clear the old generated architecture intelligence so stale classifications
    // like "ArcHive is a mobile app" do not keep appearing after reprocessing.
    await tx.architectureChange.deleteMany({
      where: {
        repositoryId,
      },
    });

    await tx.architectureChange.create({
      data: {
        repositoryId,
        changeType: "REPOSITORY_INTELLIGENCE_REPROCESSED",
        detectedTechnology: primaryTechnology,
        fileAffected: "repository-intelligence.service.ts",
        architectureDomain: primaryArchitectureDomain,
        repositoryTypes: repositoryIntelligence.identity.repositoryTypes.join(","),
        reasoningSignals: reasoningSignals.join(","),
        summary: `${repository.name} intelligence was regenerated as ${primaryRepositoryType}.`,
        evolutionSummary:
          repositoryIntelligence.assessment.evolutionInsights.summary ||
          "Repository intelligence was regenerated using the latest ArcHive intelligence engine.",
      },
    });
  });

  return {
    repository: {
      id: repository.id,
      name: repository.name,
      fullName: repository.fullName,
    },
    fingerprint,
    repositoryIntelligence,
  };
};