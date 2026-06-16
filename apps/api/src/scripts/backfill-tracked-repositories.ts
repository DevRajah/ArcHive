import "dotenv/config";
import { prisma } from "@archive/database";

// command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/backfill-tracked-repositories.ts

const trackedFullNames = [
  "DevRajah/ArcHive",
  "DevRajah/Ledger_Flow",
  "DevRajah/LedgerFlow",
  "DevRajah/backend-forge",
];

const run = async () => {
  console.log("Starting tracked repository backfill...");

  await prisma.repository.updateMany({
    data: {
      isTracked: false,
    },
  });

  const result = await prisma.repository.updateMany({
    where: {
      fullName: {
        in: trackedFullNames,
      },
    },
    data: {
      isTracked: true,
    },
  });

  console.log(`Marked ${result.count} repositories as tracked.`);
  console.log("Tracked repository backfill completed.");
};

run()
  .catch((error) => {
    console.error("Tracked repository backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });