export type PortfolioCanonicalRepositorySignals = {
  repositoryTypes: string[];
  architectureDomains: string[];
  technologies: string[];
};

export type PortfolioCountItem = {
  name: string;
  count: number;
};

export type PortfolioCanonicalDistributions = {
  repositoryTypes: PortfolioCountItem[];
  architectureDomains: PortfolioCountItem[];
  technologies: PortfolioCountItem[];
};

/**
 * Increment one repository-coverage bucket.
 *
 * Future me:
 * This function is deliberately unaware of detector occurrence counts.
 * Portfolio distribution counts mean:
 *
 * "How many repositories currently contain this signal?"
 */
const incrementCount = (
  map: Map<string, number>,
  value: string,
) => {
  const normalizedValue =
    value.trim();

  if (!normalizedValue) {
    return;
  }

  map.set(
    normalizedValue,
    (map.get(normalizedValue) || 0) + 1,
  );
};

/**
 * Sort portfolio distributions deterministically.
 *
 * Highest repository coverage comes first.
 * Ties are alphabetical.
 */
const toSortedCountArray = (
  map: Map<string, number>,
): PortfolioCountItem[] => {
  return Array.from(
    map.entries(),
  )
    .map(
      ([name, count]) => ({
        name,
        count,
      }),
    )
    .sort((a, b) => {
      if (b.count !== a.count) {
        return b.count - a.count;
      }

      return a.name.localeCompare(
        b.name,
      );
    });
};

/**
 * Aggregate canonical repository intelligence into portfolio-wide
 * repository-coverage distributions.
 *
 * Each repository contributes at most one count for a given signal.
 *
 * Example:
 *
 * Repository A:
 *   Node.js, Redis, Redis
 *
 * Repository B:
 *   Node.js, PostgreSQL
 *
 * Portfolio:
 *   Node.js    -> 2
 *   PostgreSQL -> 1
 *   Redis      -> 1
 *
 * Redis is not counted twice for Repository A.
 */
export const buildCanonicalPortfolioDistributions = (
  repositories: PortfolioCanonicalRepositorySignals[],
): PortfolioCanonicalDistributions => {
  const repositoryTypeCounts =
    new Map<string, number>();

  const architectureDomainCounts =
    new Map<string, number>();

  const technologyCounts =
    new Map<string, number>();

  for (const repository of repositories) {
    /**
     * Deduplicate inside the repository first.
     *
     * Portfolio counts describe repository coverage, not raw signal
     * occurrence frequency.
     */
    const repositoryTypes =
      Array.from(
        new Set(
          repository.repositoryTypes,
        ),
      );

    const architectureDomains =
      Array.from(
        new Set(
          repository.architectureDomains,
        ),
      );

    const technologies =
      Array.from(
        new Set(
          repository.technologies,
        ),
      );

    repositoryTypes.forEach(
      (repositoryType) => {
        incrementCount(
          repositoryTypeCounts,
          repositoryType,
        );
      },
    );

    architectureDomains.forEach(
      (architectureDomain) => {
        incrementCount(
          architectureDomainCounts,
          architectureDomain,
        );
      },
    );

    technologies.forEach(
      (technology) => {
        incrementCount(
          technologyCounts,
          technology,
        );
      },
    );
  }

  return {
    repositoryTypes:
      toSortedCountArray(
        repositoryTypeCounts,
      ),

    architectureDomains:
      toSortedCountArray(
        architectureDomainCounts,
      ),

    technologies:
      toSortedCountArray(
        technologyCounts,
      ),
  };
};