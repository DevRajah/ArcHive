-- DropForeignKey
ALTER TABLE "ArchitectureChange" DROP CONSTRAINT "ArchitectureChange_repositoryId_fkey";

-- DropForeignKey
ALTER TABLE "EngineeringRecommendation" DROP CONSTRAINT "EngineeringRecommendation_repositoryId_fkey";

-- AddForeignKey
ALTER TABLE "ArchitectureChange" ADD CONSTRAINT "ArchitectureChange_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EngineeringRecommendation" ADD CONSTRAINT "EngineeringRecommendation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
