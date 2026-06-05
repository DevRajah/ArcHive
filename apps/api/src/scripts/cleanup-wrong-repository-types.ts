import "dotenv/config";
import { prisma } from "@archive/database";

// Command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/cleanup-wrong-repository-types.ts
const WRONG_TYPE = "GO_SERVICE";

const cleanRepositoryTypes = (repositoryTypes: string | null) => {
  if (!repositoryTypes) return repositoryTypes;

  const cleanedTypes = repositoryTypes
    .split(",")
    .map((type) => type.trim())
    .filter(Boolean)
    .filter((type) => type !== WRONG_TYPE);

  return cleanedTypes.length > 0 ? cleanedTypes.join(",") : null;
};

const run = async () => {
  console.log(`Starting cleanup for wrong repository type: ${WRONG_TYPE}`);

  const changes = await prisma.architectureChange.findMany({
    where: {
      repositoryTypes: {
        contains: WRONG_TYPE,
      },
    },
    select: {
      id: true,
      repositoryTypes: true,
    },
  });

  console.log(`Found ${changes.length} architecture changes to clean.`);

  for (const change of changes) {
    const cleanedRepositoryTypes = cleanRepositoryTypes(change.repositoryTypes);

    await prisma.architectureChange.update({
      where: { id: change.id },
      data: {
        repositoryTypes: cleanedRepositoryTypes,
      },
    });

    console.log(
      `Cleaned ${change.id}: ${change.repositoryTypes} → ${
        cleanedRepositoryTypes || "null"
      }`
    );
  }

  console.log("Wrong repository type cleanup completed.");
};

run()
  .catch((error) => {
    console.error("Wrong repository type cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });