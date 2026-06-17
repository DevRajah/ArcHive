//import { RepositoryType } from "./evidence-types";
import { RepositoryType } from "../constants";

export const defaultEvidenceThreshold = 60;

export const evidenceThresholds: Partial<Record<RepositoryType, number>> = {
  FINTECH_PLATFORM: 60,
  DEVTOOL_PLATFORM: 60,
  DEVELOPER_PLATFORM: 60,
  OBSERVABILITY_PLATFORM: 65,
  SECURITY_PLATFORM: 65,
  AI_ML_PROJECT: 65,
  DATA_ENGINEERING_PROJECT: 65,
  MOBILE_APPLICATION: 60,
  SMART_TRANSPORT_PLATFORM: 65,
  INFRASTRUCTURE_PLATFORM: 60,
  DESIGN_SYSTEM: 60,
  GO_SERVICE: 55,
  RUST_SERVICE: 55,
  PYTHON_SERVICE: 55,
  LARAVEL_APPLICATION: 55,
  SPRING_BOOT_SERVICE: 55,
};

export const getEvidenceThreshold = (repositoryType: RepositoryType) => {
  return evidenceThresholds[repositoryType] || defaultEvidenceThreshold;
};