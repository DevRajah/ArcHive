import { AdminActivityAction, Prisma } from "@prisma/client";
import { prisma } from "@archive/database";

type CreateAdminActivityInput = {
  action: AdminActivityAction;
  actorUserId?: string | null;
  actorUsername?: string | null;
  repositoryId?: string | null;
  repositoryName?: string | null;
  repositoryFullName?: string | null;
  description?: string | null;
  metadata?: Prisma.InputJsonValue;
};

export const adminAuditService = {
  async createActivity(input: CreateAdminActivityInput) {
    return prisma.adminActivity.create({
      data: {
        action: input.action,
        actorUserId: input.actorUserId || null,
        actorUsername: input.actorUsername || null,
        repositoryId: input.repositoryId || null,
        repositoryName: input.repositoryName || null,
        repositoryFullName: input.repositoryFullName || null,
        description: input.description || null,
        metadata: input.metadata,
      },
    });
  },
};