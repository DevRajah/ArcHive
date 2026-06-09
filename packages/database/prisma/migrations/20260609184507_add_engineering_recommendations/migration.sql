-- CreateTable
CREATE TABLE "EngineeringRecommendation" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "recommendationKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "resolvedAt" TIMESTAMP(3),
    "evidence" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngineeringRecommendation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EngineeringRecommendation_repositoryId_recommendationKey_key" ON "EngineeringRecommendation"("repositoryId", "recommendationKey");

-- AddForeignKey
ALTER TABLE "EngineeringRecommendation" ADD CONSTRAINT "EngineeringRecommendation_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
