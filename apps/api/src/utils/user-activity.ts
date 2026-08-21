import { prisma } from "@archive/database";

/**
 * Records the latest time a human user intentionally interacted with ArcHive.
 *
 * Future me:
 * Keep this helper at USER-INITIATED boundaries only.
 *
 * Good examples:
 * - successful login
 * - importing/retracking a repository
 * - manually requesting a repository refresh
 * - generating a report
 * - explicit team actions
 *
 * Do NOT call this from:
 * - GitHub webhook processing
 * - BullMQ workers
 * - scheduled jobs
 * - automatic intelligence generation
 * - background recommendation processing
 *
 * lastActivityAt represents human product usage, not general system activity.
 */
export const touchUserActivity = async (
  userId: string,
) => {
  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: {
      id: userId,
    },

    data: {
      lastActivityAt: new Date(),
    },
  });
};