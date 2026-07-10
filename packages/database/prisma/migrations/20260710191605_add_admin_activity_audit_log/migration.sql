-- CreateEnum
CREATE TYPE "AdminActivityAction" AS ENUM ('REPOSITORY_IMPORTED', 'REPOSITORY_REPROCESSED', 'REPOSITORY_DELETED', 'INTELLIGENCE_REFRESHED', 'ENGINEERING_EVENT_PROCESSED', 'ARCHITECTURE_CHANGE_DETECTED', 'USER_CREATED', 'ADMIN_ACTION');

-- CreateTable
CREATE TABLE "AdminActivity" (
    "id" TEXT NOT NULL,
    "action" "AdminActivityAction" NOT NULL,
    "actorUserId" TEXT,
    "actorUsername" TEXT,
    "repositoryId" TEXT,
    "repositoryName" TEXT,
    "repositoryFullName" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AdminActivity_action_idx" ON "AdminActivity"("action");

-- CreateIndex
CREATE INDEX "AdminActivity_actorUserId_idx" ON "AdminActivity"("actorUserId");

-- CreateIndex
CREATE INDEX "AdminActivity_repositoryId_idx" ON "AdminActivity"("repositoryId");

-- CreateIndex
CREATE INDEX "AdminActivity_createdAt_idx" ON "AdminActivity"("createdAt");
