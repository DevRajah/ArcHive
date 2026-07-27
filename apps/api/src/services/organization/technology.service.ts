import {
  OrganizationQueryOptions,
  OrganizationTechnologyInventory,
  OrganizationTechnologyItem,
} from "../../types/organization.types";

import {
  latestSnapshot,
  loadOrganizationRepositories,
} from "./organization.utils";

/**
 * Builds an inventory of technologies used across all
 * tracked repositories.
 *
 * This allows engineering leaders to quickly answer
 * questions such as:
 *
 * • Which languages do we use?
 * • Which frameworks are most common?
 * • Which databases appear most?
 * • Which technologies are only used once?
 */
export const getTechnologyInventory = async (
  options: OrganizationQueryOptions,
): Promise<OrganizationTechnologyInventory> => {
  const repositories = await loadOrganizationRepositories(
    options.userId,
  );

  const technologies = new Map<
    string,
    OrganizationTechnologyItem
  >();

  /**
   * Adds a technology to the inventory.
   *
   * If we've seen it before we simply increase the usage
   * count and remember which repository also uses it.
   */
  const addTechnology = (
    technologyName: string,
    repositoryName: string,
  ) => {
    const name = technologyName.trim();

    if (!name) {
      return;
    }

    const existing = technologies.get(name);

    if (existing) {
      existing.repositoryCount++;

      if (!existing.repositories.includes(repositoryName)) {
        existing.repositories.push(repositoryName);
      }

      return;
    }

    technologies.set(name, {
      technology: name,
      repositoryCount: 1,
      repositories: [repositoryName],
    });
  };

  for (const repository of repositories) {
    /**
     * Repository language reported directly by GitHub.
     */
    if (repository.language) {
      addTechnology(
        repository.language,
        repository.name,
      );
    }

    const snapshot = latestSnapshot(repository);

    if (!snapshot) {
      continue;
    }

    /**
     * ArcHive stores technologies as JSON.
     *
     * We support either:
     *
     * ["Redis","Docker"]
     *
     * or
     *
     * [
     *   { name: "Redis" },
     *   { name: "Docker" }
     * ]
     */
    const technologiesJson = snapshot.technologies;

    if (!Array.isArray(technologiesJson)) {
      continue;
    }

    for (const technology of technologiesJson) {
      if (typeof technology === "string") {
        addTechnology(
          technology,
          repository.name,
        );

        continue;
      }

      if (
        technology &&
        typeof technology === "object" &&
        "name" in technology &&
        typeof technology.name === "string"
      ) {
        addTechnology(
          technology.name,
          repository.name,
        );
      }
    }
  }

  const inventory = Array.from(
    technologies.values(),
  ).sort(
    (left, right) =>
      right.repositoryCount - left.repositoryCount,
  );

  return {
    totalTechnologies: inventory.length,

    technologies: inventory,
  };
};