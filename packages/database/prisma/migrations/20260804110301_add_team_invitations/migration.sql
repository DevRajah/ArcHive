-- CreateEnum
CREATE TYPE "TeamInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateTable
CREATE TABLE "TeamInvitation" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "invitedById" TEXT NOT NULL,
    "inviteeUserId" TEXT NOT NULL,
    "role" "TeamMemberRole" NOT NULL,
    "status" "TeamInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "acceptedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TeamInvitation_teamId_idx" ON "TeamInvitation"("teamId");

-- CreateIndex
CREATE INDEX "TeamInvitation_inviteeUserId_idx" ON "TeamInvitation"("inviteeUserId");

-- CreateIndex
CREATE INDEX "TeamInvitation_status_idx" ON "TeamInvitation"("status");

-- CreateIndex
CREATE INDEX "TeamInvitation_expiresAt_idx" ON "TeamInvitation"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "TeamInvitation_teamId_inviteeUserId_status_key" ON "TeamInvitation"("teamId", "inviteeUserId", "status");

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamInvitation" ADD CONSTRAINT "TeamInvitation_inviteeUserId_fkey" FOREIGN KEY ("inviteeUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
