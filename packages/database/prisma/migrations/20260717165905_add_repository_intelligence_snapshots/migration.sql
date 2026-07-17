-- CreateTable
CREATE TABLE "RepositoryIntelligenceSnapshot" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "primaryRepositoryType" TEXT,
    "repositoryTypes" JSONB NOT NULL,
    "technologies" JSONB NOT NULL,
    "architectureDomains" JSONB NOT NULL,
    "capabilities" JSONB NOT NULL,
    "intelligenceConfidence" DOUBLE PRECISION,
    "maturityScore" DOUBLE PRECISION,
    "architectureScore" DOUBLE PRECISION,
    "capabilityScore" DOUBLE PRECISION,
    "recommendations" JSONB NOT NULL,
    "intelligence" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RepositoryIntelligenceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RepositoryIntelligenceSnapshot_repositoryId_createdAt_idx" ON "RepositoryIntelligenceSnapshot"("repositoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "RepositoryIntelligenceSnapshot" ADD CONSTRAINT "RepositoryIntelligenceSnapshot_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
