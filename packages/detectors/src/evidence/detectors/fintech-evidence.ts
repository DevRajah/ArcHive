import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectFintechEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (includesAny(combinedText, ["ledger", "double-entry"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected ledger or double-entry accounting terminology",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (includesAny(combinedText, ["reconciliation", "reconcile"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected reconciliation workflow terminology",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (includesAny(combinedText, ["settlement", "settlements"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected settlement workflow terminology",
      25,
      "DOMAIN_LANGUAGE",
      "MEDIUM"
    );
  }

  if (includesAny(combinedText, ["payment webhook", "webhook signature"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected payment webhook or webhook signature evidence",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }

  if (includesAny(combinedText, ["idempotency", "idempotency key"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected idempotency or payment safety evidence",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }

  if (
    includesAny(combinedText, [
      "transaction processing",
      "financial transaction",
    ])
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected financial transaction processing",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM"
    );
  }

  if (includesAny(combinedText, ["audit trail", "audit ledger"])) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected financial audit trail",
      20,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }
};