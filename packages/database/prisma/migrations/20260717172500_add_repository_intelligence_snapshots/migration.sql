/*
  Warnings:

  - You are about to drop the column `intelligenceConfidence` on the `RepositoryIntelligenceSnapshot` table. All the data in the column will be lost.
  - You are about to alter the column `maturityScore` on the `RepositoryIntelligenceSnapshot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `architectureScore` on the `RepositoryIntelligenceSnapshot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `capabilityScore` on the `RepositoryIntelligenceSnapshot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "RepositoryIntelligenceSnapshot" DROP COLUMN "intelligenceConfidence",
ADD COLUMN     "confidenceScore" INTEGER,
ADD COLUMN     "engineeringQualityScore" INTEGER,
ADD COLUMN     "productionReadinessScore" INTEGER,
ALTER COLUMN "maturityScore" SET DATA TYPE INTEGER,
ALTER COLUMN "architectureScore" SET DATA TYPE INTEGER,
ALTER COLUMN "capabilityScore" SET DATA TYPE INTEGER;
