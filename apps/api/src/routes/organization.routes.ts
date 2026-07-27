import { FastifyInstance } from "fastify";

import {
  getOrganizationDashboard,
} from "../services/organization/dashboard.service";

import {
  getOrganizationOverview,
} from "../services/organization/overview.service";

import {
  getRepositoryRankings,
} from "../services/organization/rankings.service";

import {
  getTechnologyInventory,
} from "../services/organization/technology.service";

import {
  getOrganizationRecommendations,
} from "../services/organization/recommendations.service";

import {
  getOrganizationRisks,
} from "../services/organization/risks.service";

import {
  getOrganizationActivityFeed,
} from "../services/organization/activity.service";

import {
  getOrganizationTrends,
} from "../services/organization/trends.service";

/**
 * Organization Intelligence Routes
 *
 * Every endpoint returns engineering intelligence
 * calculated across all repositories that belong
 * to a single user.
 */
export default async function organizationRoutes(
  app: FastifyInstance,
) {
  app.get(
    "/users/:userId/organization/overview",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationOverview({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/rankings",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getRepositoryRankings({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/technology",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getTechnologyInventory({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/recommendations",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationRecommendations({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/risks",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationRisks({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/activity",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationActivityFeed({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/trends",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationTrends({
        userId,
      });
    },
  );

  app.get(
    "/users/:userId/organization/dashboard",
    async (request) => {
      const { userId } = request.params as {
        userId: string;
      };

      return getOrganizationDashboard({
        userId,
      });
    },
  );
}