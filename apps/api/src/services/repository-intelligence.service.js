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
export const generateRepositoryIntelligence = async ({ repositoryId, }) => {
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
        .filter((file) => Boolean(file));
    const commitMessages = [
        repository.name,
        repository.fullName,
        repository.description || "",
        repository.language || "",
        ...repository.architectureChanges.map((change) => [
            change.changeType,
            change.detectedTechnology || "",
            change.summary,
            change.repositoryTypes || "",
            change.reasoningSignals || "",
            change.architectureDomain || "",
            change.evolutionSummary || "",
        ].join(" ")),
    ].filter(Boolean);
    const fingerprint = detectTechnologyFingerprint(filesChanged, commitMessages);
    const repositoryIntelligence = fingerprint.repositoryIntelligence;
    const primaryRepositoryType = repositoryIntelligence.identity.repositoryTypes[0] ||
        fingerprint.repositoryTypes[0] ||
        "GENERAL_ENGINEERING_PROJECT";
    const primaryTechnology = repositoryIntelligence.signals.technologies[0] ||
        fingerprint.technologies[0] ||
        "Repository Intelligence";
    const primaryArchitectureDomain = repositoryIntelligence.signals.architectureDomains[0] ||
        fingerprint.architectureDomains[0] ||
        "GENERAL_ENGINEERING";
    const reasoningSignals = repositoryIntelligence.signals.reasoningSignals.length > 0
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
                evolutionSummary: repositoryIntelligence.assessment.evolutionInsights.summary ||
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

const GENERATED_CHANGE_TYPE = "REPOSITORY_INTELLIGENCE_REPROCESSED";

const repositoryTypePriority = [
  "ENGINEERING_INTELLIGENCE_PLATFORM",
  "FINTECH_PLATFORM",
  "DEVTOOL_PLATFORM",
  "DEVELOPER_PLATFORM",
  "SECURITY_PLATFORM",
  "AI_ML_PROJECT",
  "DATA_ENGINEERING_PROJECT",
  "SMART_TRANSPORT_PLATFORM",
  "ENERGY_PLATFORM",
  "HEALTHCARE_PLATFORM",
  "ECOMMERCE_PLATFORM",
  "EDUCATION_PLATFORM",
  "COLLABORATION_PLATFORM",
  "MOBILE_APPLICATION",
  "BACKEND_SERVICE",
  "FRONTEND_APPLICATION",
  "PACKAGE_LIBRARY",
  "DOCUMENTATION_HEAVY_REPOSITORY",
  "JAVASCRIPT_TYPESCRIPT_PROJECT",
];

const sortRepositoryTypesByPurpose = (repositoryTypes: string[]) => {
  return [...repositoryTypes].sort((a, b) => {
    const aIndex = repositoryTypePriority.indexOf(a);
    const bIndex = repositoryTypePriority.indexOf(b);

    const safeAIndex = aIndex === -1 ? 999 : aIndex;
    const safeBIndex = bIndex === -1 ? 999 : bIndex;

    return safeAIndex - safeBIndex;
  });
};

export const generateRepositoryIntelligence = async ({
  repositoryId,
}: {
  repositoryId: string;
}) => {
  const repository = await prisma.repository.findUnique({
    where: { id: repositoryId },
    include: {
      architectureChanges: {
        orderBy: { createdAt: "desc" },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      timelineEntries: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  const realArchitectureChanges = repository.architectureChanges.filter(
    (change) => change.changeType !== GENERATED_CHANGE_TYPE
  );

  const filesChanged = realArchitectureChanges
    .map((change) => change.fileAffected)
    .filter((file): file is string => Boolean(file));

  const commitMessages = [
    repository.name,
    repository.fullName,
    repository.description || "",
    repository.language || "",

    ...realArchitectureChanges.map((change) =>
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

    ...repository.events.map((event) =>
      [
        event.eventType,
        JSON.stringify(event.rawPayload || {}),
      ].join(" ")
    ),

    ...repository.timelineEntries.map((entry) =>
      [
        entry.title,
        entry.description || "",
      ].join(" ")
    ),
  ].filter(Boolean);

  const fingerprint = detectTechnologyFingerprint(filesChanged, commitMessages);

  const repositoryIntelligence = fingerprint.repositoryIntelligence;

  const sortedRepositoryTypes = sortRepositoryTypesByPurpose(
    repositoryIntelligence.identity.repositoryTypes.length > 0
      ? repositoryIntelligence.identity.repositoryTypes
      : fingerprint.repositoryTypes
  );

  const primaryRepositoryType =
    sortedRepositoryTypes[0] || "GENERAL_ENGINEERING_PROJECT";

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
    // I only clear previously generated intelligence rows.
    // I must NOT delete real architecture history, webhook history, or timeline-derived changes,
    // otherwise future refreshes will lose the evidence needed to classify the repository correctly.
    await tx.architectureChange.deleteMany({
      where: {
        repositoryId,
        changeType: GENERATED_CHANGE_TYPE,
      },
    });

    await tx.architectureChange.create({
      data: {
        repositoryId,
        changeType: GENERATED_CHANGE_TYPE,
        detectedTechnology: primaryTechnology,
        fileAffected: "repository-intelligence.service.ts",
        architectureDomain: primaryArchitectureDomain,
        repositoryTypes: sortedRepositoryTypes.join(","),
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