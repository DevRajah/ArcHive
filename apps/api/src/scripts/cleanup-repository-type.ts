import "dotenv/config";
import { prisma } from "@archive/database";


// Command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/cleanup-repository-type.ts <REPOSITORY_TYPE_TO_REMOVE>
const repositoryTypeToRemove = process.argv[2];

if (!repositoryTypeToRemove) {
  console.error("Please provide repository type to remove.");
  console.error("Example: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/cleanup-repository-type.ts OBSERVABILITY_PLATFORM");
  process.exit(1);
}

const run = async () => {
  console.log(`Cleaning repository type: ${repositoryTypeToRemove}`);

  const changes = await prisma.architectureChange.findMany({
    where: {
      repositoryTypes: {
        contains: repositoryTypeToRemove,
      },
    },
    select: {
      id: true,
      repositoryTypes: true,
    },
  });

  console.log(`Found ${changes.length} architecture changes to inspect.`);

  for (const change of changes) {
    const cleanedTypes =
      change.repositoryTypes
        ?.split(",")
        .map((type) => type.trim())
        .filter(Boolean)
        .filter((type) => type !== repositoryTypeToRemove) || [];

    await prisma.architectureChange.update({
      where: { id: change.id },
      data: {
        repositoryTypes: cleanedTypes.length > 0 ? cleanedTypes.join(",") : null,
      },
    });

    console.log(`Cleaned ${change.id}`);
  }

  console.log("Repository type cleanup completed.");
};

run()
  .catch((error) => {
    console.error("Cleanup failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });