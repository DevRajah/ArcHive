import { EngineeringQualityContext } from "./quality-context";

import {
  detectArchitectureQuality,
  detectDevopsQuality,
  detectDocumentationQuality,
  detectMaintainabilityQuality,
  detectObservabilityQuality,
  detectScalabilityQuality,
  detectSecurityQuality,
  detectTestingQuality,
} from "./detectors";

export type QualityDetector = (context: EngineeringQualityContext) => void;

export const qualityDetectors: QualityDetector[] = [
  detectArchitectureQuality,
  detectScalabilityQuality,
  detectSecurityQuality,
  detectTestingQuality,
  detectObservabilityQuality,
  detectMaintainabilityQuality,
  detectDocumentationQuality,
  detectDevopsQuality,
];

export const runQualityDetectors = (context: EngineeringQualityContext) => {
  for (const detector of qualityDetectors) {
    detector(context);
  }
};