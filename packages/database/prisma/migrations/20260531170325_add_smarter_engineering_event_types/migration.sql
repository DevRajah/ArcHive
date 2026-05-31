/*
  Warnings:

  - The values [PUSH,DEPENDENCY_ADDED] on the enum `EngineeringEventType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EngineeringEventType_new" AS ENUM ('UNKNOWN', 'QUEUE_ADDED', 'QUEUE_INFRASTRUCTURE_UPDATED', 'REDIS_ADDED', 'REDIS_INFRASTRUCTURE_ADDED', 'REDIS_INFRASTRUCTURE_UPDATED', 'DOCKER_ADDED', 'DOCKER_INFRASTRUCTURE_CHANGED', 'DOCKER_INFRASTRUCTURE_UPDATED', 'DATABASE_CHANGE', 'DATABASE_SCHEMA_CHANGED', 'DATABASE_SCHEMA_UPDATED', 'API_ENDPOINT_CHANGED', 'AUTH_SYSTEM_CHANGED', 'DEPENDENCY_CHANGED', 'FRONTEND_UI_CHANGED', 'ENGINEERING_EVENT', 'PULL_REQUEST', 'PR_MERGED', 'COMMIT_PUSHED');
ALTER TABLE "EngineeringEvent" ALTER COLUMN "eventType" TYPE "EngineeringEventType_new" USING ("eventType"::text::"EngineeringEventType_new");
ALTER TYPE "EngineeringEventType" RENAME TO "EngineeringEventType_old";
ALTER TYPE "EngineeringEventType_new" RENAME TO "EngineeringEventType";
DROP TYPE "public"."EngineeringEventType_old";
COMMIT;
