-- CreateEnum
CREATE TYPE "ArchitectureAdvisorSeverity" AS ENUM ('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ArchitectureAdvisorCategory" AS ENUM ('ARCHITECTURE', 'PRODUCTION_READINESS', 'SECURITY', 'SCALABILITY', 'RELIABILITY', 'MAINTAINABILITY', 'OBSERVABILITY', 'DATA', 'DELIVERY', 'ENGINEERING_QUALITY');

-- CreateTable
CREATE TABLE "ArchitectureAdvisorSnapshot" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "overallAssessment" TEXT NOT NULL,
    "maturityLabel" TEXT NOT NULL,
    "strengths" JSONB NOT NULL,
    "architectureConcerns" JSONB NOT NULL,
    "productionRisks" JSONB NOT NULL,
    "securityObservations" JSONB NOT NULL,
    "scalabilityConcerns" JSONB NOT NULL,
    "reliabilityConcerns" JSONB NOT NULL,
    "maintainabilityConcerns" JSONB NOT NULL,
    "observabilityConcerns" JSONB NOT NULL,
    "dataConcerns" JSONB NOT NULL,
    "deliveryConcerns" JSONB NOT NULL,
    "priorityActions" JSONB NOT NULL,
    "recommendedNextSteps" JSONB NOT NULL,
    "evidenceSummary" JSONB NOT NULL,
    "overallRiskScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "sourceIntelligenceSnapshotId" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArchitectureAdvisorSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ArchitectureAdvisorSnapshot_repositoryId_generatedAt_idx" ON "ArchitectureAdvisorSnapshot"("repositoryId", "generatedAt");

-- CreateIndex
CREATE INDEX "ArchitectureAdvisorSnapshot_overallRiskScore_idx" ON "ArchitectureAdvisorSnapshot"("overallRiskScore");

-- CreateIndex
CREATE INDEX "ArchitectureAdvisorSnapshot_confidenceScore_idx" ON "ArchitectureAdvisorSnapshot"("confidenceScore");

-- AddForeignKey
ALTER TABLE "ArchitectureAdvisorSnapshot" ADD CONSTRAINT "ArchitectureAdvisorSnapshot_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
