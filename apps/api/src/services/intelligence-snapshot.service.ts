import { Prisma } from "@prisma/client";
import type { detectTechnologyFingerprint } from "@archive/detectors";

type FingerprintResult = ReturnType<typeof detectTechnologyFingerprint>;

type CreateSnapshotInput = {
  tx: Prisma.TransactionClient;
  repositoryId: string;
  fingerprint: FingerprintResult;
};

/*
|--------------------------------------------------------------------------
| Convert generated intelligence into database-safe JSON.
|
| Intelligence reports are plain TypeScript objects, but Prisma requires
| values written into Json fields to match its JSON input contract.
| Serialising the value also removes any undefined properties that cannot
| be represented in PostgreSQL JSON.
|--------------------------------------------------------------------------
*/
const toJsonValue = (value: unknown): Prisma.InputJsonValue => {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
};

const calculateCapabilityScore = (
  capabilities: FingerprintResult["capabilities"]
) => {
  if (capabilities.length === 0) {
    return null;
  }

  const totalConfidence = capabilities.reduce(
    (total, capability) => total + capability.confidence,
    0
  );

  return Math.round(totalConfidence / capabilities.length);
};

export const createRepositoryIntelligenceSnapshot = async ({
  tx,
  repositoryId,
  fingerprint,
}: CreateSnapshotInput) => {
  const repositoryIntelligence = fingerprint.repositoryIntelligence;

  const repositoryTypes =
    repositoryIntelligence.identity.repositoryTypes.length > 0
      ? repositoryIntelligence.identity.repositoryTypes
      : fingerprint.repositoryTypes;

  const technologies =
    repositoryIntelligence.signals.technologies.length > 0
      ? repositoryIntelligence.signals.technologies
      : fingerprint.technologies;

  const architectureDomains =
    repositoryIntelligence.signals.architectureDomains.length > 0
      ? repositoryIntelligence.signals.architectureDomains
      : fingerprint.architectureDomains;

  const capabilities =
    repositoryIntelligence.signals.capabilities.length > 0
      ? repositoryIntelligence.signals.capabilities
      : fingerprint.capabilities;

  /*
  |--------------------------------------------------------------------------
  | Every refresh creates a new immutable record.
  |
  | Existing snapshots are deliberately not updated or deleted. Keeping each
  | generated version allows ArcHive to compare its current understanding with
  | the immediately previous result.
  |--------------------------------------------------------------------------
  */

  return tx.repositoryIntelligenceSnapshot.create({
    data: {
      repositoryId,

      primaryRepositoryType:
        repositoryIntelligence.identity.primaryRepositoryType ||
        repositoryTypes[0] ||
        null,

      repositoryTypes: toJsonValue(repositoryTypes),
      technologies: toJsonValue(technologies),
      architectureDomains: toJsonValue(architectureDomains),
      capabilities: toJsonValue(capabilities),
      recommendations: toJsonValue(fingerprint.recommendationReport),
      intelligence: toJsonValue(repositoryIntelligence),

      confidenceScore: fingerprint.repositoryDNA.confidenceScore,
      maturityScore: fingerprint.repositoryMaturity.score,

      /*
      | Architecture intelligence currently does not expose one canonical
      | numerical score. The field remains available for a future engine update
      | without inventing a misleading value today.
      */
      architectureScore:
        fingerprint.architectureQuality.score,

      capabilityScore: calculateCapabilityScore(fingerprint.capabilities),
      engineeringQualityScore: fingerprint.engineeringQuality.overallScore,
      productionReadinessScore: fingerprint.productionReadiness.score,
    },
  });
};