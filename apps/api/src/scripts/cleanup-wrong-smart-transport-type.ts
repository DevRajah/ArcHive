import { prisma } from "@archive/database";

// Command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/cleanup-wrong-smart-transport-type.ts
const WRONG_TYPE = "SMART_TRANSPORT_PLATFORM";

const cleanupWrongSmartTransportType = async () => {
  console.log(
    "Starting SMART_TRANSPORT_PLATFORM cleanup..."
  );

  const architectureChanges =
    await prisma.architectureChange.findMany({
      where: {
        repositoryTypes: {
          contains: WRONG_TYPE,
        },
      },
    });

  console.log(
    `Found ${architectureChanges.length} architecture changes containing ${WRONG_TYPE}.`
  );

  for (const change of architectureChanges) {
    const existingTypes =
      change.repositoryTypes
        ?.split(",")
        .map((type) => type.trim())
        .filter(Boolean) || [];

    const cleanedTypes = existingTypes.filter(
      (type) => type !== WRONG_TYPE
    );

    await prisma.architectureChange.update({
      where: {
        id: change.id,
      },
      data: {
        repositoryTypes: cleanedTypes.join(","),
      },
    });

    console.log(
      `Cleaned architecture change ${change.id}`
    );
  }

  console.log(
    "SMART_TRANSPORT_PLATFORM cleanup completed."
  );
};

cleanupWrongSmartTransportType()
  .catch((error) => {
    console.error(
      "SMART_TRANSPORT_PLATFORM cleanup failed:",
      error
    );
  })
  .finally(async () => {
    await prisma.$disconnect();
  });