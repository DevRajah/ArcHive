import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectSecurityEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "threat detection",
      "fraud detection",
      "anomaly detection",
      "intrusion detection",
    ])
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected threat, fraud, anomaly, or intrusion detection evidence",
      35,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "vulnerability scanning",
      "malware",
      "security event",
      "security audit",
      "owasp",
    ])
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected security scanning, audit, OWASP, or security event evidence",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "risk scoring",
      "access policy",
      "rbac policy",
      "permission policy",
      "zero trust",
    ])
  ) {
    addEvidence(
      "SECURITY_PLATFORM",
      "Detected risk scoring or security policy evidence",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }
};