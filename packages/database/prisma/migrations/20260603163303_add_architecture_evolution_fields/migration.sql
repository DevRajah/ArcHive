-- DropForeignKey
ALTER TABLE "ArchitectureChange" DROP CONSTRAINT "ArchitectureChange_repositoryId_fkey";

-- AlterTable
ALTER TABLE "ArchitectureChange" ADD COLUMN     "architectureDomain" TEXT,
ADD COLUMN     "evolutionSummary" TEXT;

-- AddForeignKey
ALTER TABLE "ArchitectureChange" ADD CONSTRAINT "ArchitectureChange_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
