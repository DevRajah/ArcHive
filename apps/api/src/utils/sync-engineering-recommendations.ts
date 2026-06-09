import { prisma } from "@archive/database";

type RecommendationInput = {
  key: string;
  title: string;
  description: string;
  resolvesWhenDomainAppears?: string;
};

export const syncEngineeringRecommendations = async ({
  repositoryId,
  recommendations,
}: {
  repositoryId: string;
  recommendations: RecommendationInput[];
}) => {
  for (const recommendation of recommendations) {
    await prisma.engineeringRecommendation.upsert({
      where: {
        repositoryId_recommendationKey: {
          repositoryId,
          recommendationKey: recommendation.key,
        },
      },
      update: {
        title: recommendation.title,
        description: recommendation.description,
      },
      create: {
        repositoryId,
        recommendationKey: recommendation.key,
        title: recommendation.title,
        description: recommendation.description,
        status: "ACTIVE",
      },
    });
  }

  return prisma.engineeringRecommendation.findMany({
    where: { repositoryId },
    orderBy: { createdAt: "desc" },
  });
};