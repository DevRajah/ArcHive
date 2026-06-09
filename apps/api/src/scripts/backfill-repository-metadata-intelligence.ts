import "dotenv/config";
import { prisma } from "@archive/database";
import { detectTechnologyFingerprint } from "@archive/detectors";


//command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/backfill-repository-metadata-intelligence.ts
const run = async () => {
  console.log("Starting repository metadata intelligence backfill...");

  const repositories = await prisma.repository.findMany({
    select: {
      id: true,
      name: true,
      fullName: true,
      description: true,
      language: true,
      architectureChanges: {
        select: { id: true },
        take: 1,
      },
    },
  });

  for (const repo of repositories) {
    const context = [
      repo.name,
      repo.fullName,
      repo.description,
      repo.language,
    ]
      .filter(Boolean)
      .join(" ");

    const fingerprint = detectTechnologyFingerprint([context], []);

    if (fingerprint.repositoryTypes.length === 0) {
      console.log(`Skipped ${repo.fullName}: no repository type detected`);
      continue;
    }

    await prisma.architectureChange.create({
      data: {
        repositoryId: repo.id,
        changeType: "REPOSITORY_IDENTITY_DETECTED",
        detectedTechnology:
          fingerprint.technologies[0] || repo.language || "Repository Metadata",
        fileAffected: null,
        summary: `ArcHive identified this repository from its metadata as ${fingerprint.repositoryTypes
          .join(", ")
          .replaceAll("_", " ")
          .toLowerCase()}.`,
        architectureDomain:
          fingerprint.architectureDomains[0] || "REPOSITORY_IDENTITY",
        evolutionSummary:
          "This metadata-based intelligence record helps ArcHive classify repositories even when limited webhook history exists.",
        repositoryTypes: fingerprint.repositoryTypes.join(","),
        reasoningSignals: fingerprint.reasoningSignals.join(" | "),
      },
    });

    console.log(
      `Backfilled ${repo.fullName}: ${fingerprint.repositoryTypes.join(", ")}`
    );
  }

  console.log("Repository metadata intelligence backfill completed.");
};

run()
  .catch((error) => {
    console.error("Repository metadata intelligence backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });