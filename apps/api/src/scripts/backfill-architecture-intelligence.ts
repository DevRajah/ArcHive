import "dotenv/config";
import { prisma } from "@archive/database";
import { mapArchitectureDomain } from "@archive/detectors";

// Command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/backfill-architecture-intelligence.ts
const generateEvolutionSummary = (architectureDomain: string) => {
  return `This historical change contributed to the repository's ${architectureDomain
    .replaceAll("_", " ")
    .toLowerCase()} evolution.`;
};

const run = async () => {
  console.log("Starting architecture intelligence backfill...");

  const changes = await prisma.architectureChange.findMany({
    where: {
      OR: [{ architectureDomain: null }, { evolutionSummary: null }],
    },
  });

  console.log(`Found ${changes.length} architecture changes to backfill.`);

  for (const change of changes) {
    const architectureDomain = mapArchitectureDomain({
      changeType: change.changeType,
    });

    const evolutionSummary = generateEvolutionSummary(architectureDomain);

    await prisma.architectureChange.update({
      where: { id: change.id },
      data: {
        architectureDomain:
          change.architectureDomain || architectureDomain,
        evolutionSummary:
          change.evolutionSummary || evolutionSummary,
      },
    });

    console.log(`Backfilled architecture change ${change.id}`);
  }

  console.log("Architecture intelligence backfill completed.");
};

run()
  .catch((error) => {
    console.error("Architecture intelligence backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });