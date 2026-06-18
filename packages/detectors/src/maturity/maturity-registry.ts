import { MaturityInput, MaturityAssessment } from "./maturity-types";

import { assessArchitectureMaturity } from "./architecture-maturity";
import { assessScalabilityMaturity } from "./scalability-maturity";
import { assessSecurityMaturity } from "./security-maturity";
import { assessTestingMaturity } from "./testing-maturity";
import { assessObservabilityMaturity } from "./observability-maturity";
import { assessMaintainabilityMaturity } from "./maintainability-maturity";
import { assessDocumentationMaturity } from "./documentation-maturity";
import { assessDevOpsMaturity } from "./devops-maturity";
import { assessProductionReadinessMaturity } from "./production-readiness-maturity";

export type MaturityDetector = (input: MaturityInput) => MaturityAssessment;

export const maturityDetectors: MaturityDetector[] = [
  assessArchitectureMaturity,
  assessScalabilityMaturity,
  assessSecurityMaturity,
  assessTestingMaturity,
  assessObservabilityMaturity,
  assessMaintainabilityMaturity,
  assessDocumentationMaturity,
  assessDevOpsMaturity,
  assessProductionReadinessMaturity,
];

export const runMaturityDetectors = (input: MaturityInput) => {
  return maturityDetectors.map((detector) => detector(input));
};