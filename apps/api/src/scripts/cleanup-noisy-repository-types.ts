import "dotenv/config";
import { prisma } from "@archive/database";

// command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/cleanup-noisy-repository-types.ts
const noisyTypes = [
  "AI_ML_PROJECT",
  "DATA_ENGINEERING_PROJECT",
  "MOBILE_APPLICATION",
  "SECURITY_PLATFORM",
];

const run = async () => {
  console.log("Starting noisy repository type cleanup...");

  const changes = await prisma.architectureChange.findMany({
    where: {
      OR: noisyTypes.map((type) => ({
        repositoryTypes: {
          contains: type,
        },
      })),
    },
    select: {
      id: true,
      repositoryTypes: true,
      reasoningSignals: true,
    },
  });

  console.log(`Found ${changes.length} records to inspect.`);

  for (const change of changes) {
    const cleanedTypes =
      change.repositoryTypes
        ?.split(",")
        .map((type) => type.trim())
        .filter(Boolean)
        .filter((type) => !noisyTypes.includes(type)) || [];

    const cleanedSignals =
      change.reasoningSignals
        ?.split(" | ")
        .map((signal) => signal.trim())
        .filter(Boolean)
        .filter(
          (signal) =>
            !signal.toLowerCase().includes("ai and machine learning") &&
            !signal.toLowerCase().includes("react native") &&
            !signal.toLowerCase().includes("security and threat") &&
            !signal.toLowerCase().includes("data pipeline")
        ) || [];

    await prisma.architectureChange.update({
      where: { id: change.id },
      data: {
        repositoryTypes: cleanedTypes.length ? cleanedTypes.join(",") : null,
        reasoningSignals: cleanedSignals.length
          ? cleanedSignals.join(" | ")
          : null,
      },
    });

    console.log(`Cleaned ${change.id}`);
  }

  console.log("Noisy repository type cleanup completed.");
};

run()
  .catch((error) => {
    console.error("Noisy repository type cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });