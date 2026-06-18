import { prisma } from "@archive/database";

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
    where: {
      id: repositoryId,
    },
  });

  if (!repository) {
    throw new Error("Repository not found");
  }

  // TODO:
  // 1. Fetch latest repository metadata
  // 2. Analyse repository
  // 3. Persist architecture changes
  // 4. Persist intelligence report
  // 5. Return final intelligence

  return repository;
};