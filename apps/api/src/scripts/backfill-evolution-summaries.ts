import "dotenv/config";

import { prisma } from "@archive/database";

// Command to run this script: npx dotenv -e packages/database/.env -- tsx apps/api/src/scripts/backfill-evolution-summaries.ts
const generateEvolutionSummary = ({
  domain,
  technology,
  summary,
}: {
  domain: string | null;
  technology: string | null;
  summary: string;
}) => {
  if (domain === "QUEUE_INFRASTRUCTURE") {
    return `Queue infrastructure evolved through worker or asynchronous processing updates involving ${technology || "background processing"}.`;
  }

  if (domain === "REALTIME_SYSTEMS") {
    return `Realtime architecture evolved through websocket or event-streaming updates involving ${technology || "realtime systems"}.`;
  }

  if (domain === "DATABASE_LAYER") {
    return `Database and persistence architecture evolved through schema or migration updates involving ${technology || "database infrastructure"}.`;
  }

  if (domain === "API_LAYER") {
    return `API architecture evolved through backend service updates involving ${technology || "service-layer logic"}.`;
  }

  if (domain === "FRONTEND_ARCHITECTURE") {
    return `Frontend architecture evolved through UI and client-side updates involving ${technology || "frontend systems"}.`;
  }

  if (domain === "ARCHITECTURE_INTELLIGENCE") {
    return `Repository intelligence and semantic engineering analysis evolved through updates involving ${technology || "architecture reasoning systems"}.`;
  }

  if (domain === "TYPE_CONTRACTS") {
    return `Type-safe engineering contracts evolved through updates involving ${technology || "TypeScript contracts"}.`;
  }

  return `Repository engineering architecture evolved through updates involving ${technology || summary}.`;
};

const run = async () => {
  console.log("Starting evolution summary backfill...");

  const changes = await prisma.architectureChange.findMany({
    select: {
      id: true,
      architectureDomain: true,
      detectedTechnology: true,
      summary: true,
      evolutionSummary: true,
    },
  });

  console.log(`Found ${changes.length} architecture changes.`);

  let updatedCount = 0;

  for (const change of changes) {
    const isMissing =
      !change.evolutionSummary ||
      change.evolutionSummary.trim().length === 0;

    const isGeneric =
      change.evolutionSummary?.includes(
        "ArcHive detected background_processing activity"
      ) ||
      change.evolutionSummary?.includes(
        "This historical change contributed"
      );

    if (!isMissing && !isGeneric) {
      continue;
    }

    const evolutionSummary = generateEvolutionSummary({
      domain: change.architectureDomain,
      technology: change.detectedTechnology,
      summary: change.summary,
    });

    await prisma.architectureChange.update({
      where: {
        id: change.id,
      },
      data: {
        evolutionSummary,
      },
    });

    updatedCount++;

    console.log(`Updated ${change.id}`);
  }

  console.log(
    `Evolution summary backfill completed. Updated ${updatedCount} records.`
  );
};

run()
  .catch((error) => {
    console.error("Evolution summary backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });