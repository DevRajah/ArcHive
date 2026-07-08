import { prisma } from "@archive/database";
import { GENERATED_CHANGE_TYPE } from "../../constants/intelligence.constants";

const splitStoredList = (value?: string | null) => {
  if (!value) return [];

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
};

const increment = (map: Map<string, number>, key?: string | null) => {
  if (!key) return;
  map.set(key, (map.get(key) || 0) + 1);
};

const toCountArray = (map: Map<string, number>) =>
  Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

export const adminAnalyticsService = {
  async getAnalytics() {
    const [repositories, latestIntelligenceRows] = await Promise.all([
      prisma.repository.findMany({
        select: {
          language: true,
        },
      }),
      prisma.architectureChange.findMany({
        where: {
          changeType: GENERATED_CHANGE_TYPE,
        },
        select: {
          repositoryTypes: true,
          architectureDomain: true,
          detectedTechnology: true,
        },
      }),
    ]);

    const languages = new Map<string, number>();
    const repositoryTypes = new Map<string, number>();
    const architectureDomains = new Map<string, number>();
    const technologies = new Map<string, number>();

    repositories.forEach((repository) => {
      increment(languages, repository.language || "Unknown");
    });

    latestIntelligenceRows.forEach((row) => {
      splitStoredList(row.repositoryTypes).forEach((type) =>
        increment(repositoryTypes, type)
      );

      increment(architectureDomains, row.architectureDomain);
      increment(technologies, row.detectedTechnology);
    });

    return {
      languages: toCountArray(languages),
      repositoryTypes: toCountArray(repositoryTypes),
      architectureDomains: toCountArray(architectureDomains),
      technologies: toCountArray(technologies),
    };
  },
};