import type {
  EvidenceContext,
} from "../evidence-types";

const FINTECH_PACKAGES = [
  "stripe",
  "@stripe/stripe-js",
  "paypal-rest-sdk",
  "@paypal/paypal-server-sdk",
  "paystack",
  "flutterwave-node-v3",
  "square",
  "plaid",
  "braintree",
  "adyen-node-api-library",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

const matchesAnyPath = (
  files: string[],
  patterns: RegExp[],
): boolean => {
  return files.some((file) => {
    const normalizedPath = file
      .replace(/\\/g, "/")
      .toLowerCase();

    return patterns.some((pattern) =>
      pattern.test(normalizedPath),
    );
  });
};

/**
 * Detects financial platforms that implement payments, ledgers,
 * reconciliation, settlements, wallets, or transaction processing.
 *
 * Future me:
 * Words such as transaction, payment, audit, webhook, or idempotency can
 * appear in ordinary applications. Fintech classification requires multiple
 * connected financial workflows or strong implementation evidence.
 */
export const detectFintechEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasPaymentDependency =
    hasAnySetValue(
      dependencies,
      FINTECH_PACKAGES,
    );

  const hasPaymentImport =
    hasAnySetValue(
      imports,
      FINTECH_PACKAGES,
    );

  /**
   * Structural checks intentionally support both folder-based domain
   * organisation and file-based MVC/service organisation.
   *
   * LedgerFlow, for example, uses files such as:
   *
   * src/controllers/ledger.controller.ts
   * src/services/reconciliation.service.ts
   * src/routes/settlement.routes.ts
   */
  const hasLedgerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)ledgers?\//,
        /(^|\/)journal-entries?\//,
        /(^|\/)double-entry\//,
        /(^|\/)accounts?\//,

        /(^|\/)ledger\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)ledger-entry\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)journal-entry\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
      ],
    );

  const hasPaymentStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)payments?\//,
        /(^|\/)payment-events?\//,
        /(^|\/)payment-providers?\//,
        /(^|\/)payment-gateways?\//,
        /(^|\/)payment-webhooks?\//,

        /(^|\/)payment\.(controller|service|routes?|router|repository|model|queue|worker)\.(ts|js|py)$/,
        /(^|\/)payment-event\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)payment-reprocess\.(controller|service|routes?|router)\.(ts|js|py)$/,
      ],
    );

  const hasReconciliationStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)reconciliation\//,
        /(^|\/)reconciliations?\//,
        /(^|\/)reconcile\//,

        /(^|\/)reconciliation\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)reconcile\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
      ],
    );

  const hasSettlementStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)settlement\//,
        /(^|\/)settlements?\//,

        /(^|\/)settlement\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
      ],
    );

  const hasWalletOrBalanceStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)wallets?\//,
        /(^|\/)balances?\//,
        /(^|\/)transfers?\//,
        /(^|\/)beneficiaries?\//,

        /(^|\/)wallet\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)balance\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)transfer\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
      ],
    );

  const hasFinancialAuditStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)audit-ledger\//,
        /(^|\/)financial-audit\//,
        /(^|\/)transaction-history\//,
        /(^|\/)financial-events?\//,

        /(^|\/)audit\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
        /(^|\/)audit-ledger\.(controller|service|routes?|router|repository|model)\.(ts|js|py)$/,
      ],
    );

  const financialCapabilityCount = [
    hasLedgerStructure,
    hasPaymentStructure,
    hasReconciliationStructure,
    hasSettlementStructure,
    hasWalletOrBalanceStructure,
    hasFinancialAuditStructure,
  ].filter(Boolean).length;

  /*
  |--------------------------------------------------------------------------
  | Temporary detector diagnostics.
  |
  | Keep this while we validate LedgerFlow, TransitIQ, GridWise, and the
  | remaining repositories. Remove it once purpose detection is stable.
  |--------------------------------------------------------------------------
  */
  console.log(
    "========== FINTECH DETECTOR ==========",
  );

  console.log({
    hasPaymentDependency,
    hasPaymentImport,

    hasLedgerStructure,
    hasPaymentStructure,
    hasReconciliationStructure,
    hasSettlementStructure,
    hasWalletOrBalanceStructure,
    hasFinancialAuditStructure,

    financialCapabilityCount,

    filesChangedCount:
      filesChanged.length,

    repositoryFilesCount:
      repositoryFiles.length,
  });

  console.log(
    "Fintech descriptive text preview:",
    descriptiveText.substring(
      0,
      700,
    ),
  );

  console.log(
    "======================================",
  );

  const hasFinancialCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "double entry",
        "debit account",
        "credit account",
        "ledger entry",
        "payment reference",
        "payment webhook",
        "webhook signature",
        "settlement batch",
        "reconciliation status",
        "transaction amount",
        "wallet balance",
        "idempotency key",
        "financial transaction",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasPaymentSafetyCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      return (
        (
          content.includes(
            "idempotency",
          ) &&
          (
            content.includes(
              "payment",
            ) ||
            content.includes(
              "transaction",
            ) ||
            content.includes(
              "transfer",
            )
          )
        ) ||
        (
          content.includes(
            "webhook signature",
          ) &&
          content.includes(
            "payment",
          )
        )
      );
    });

  const hasStrongFintechPurpose =
    [
      "fintech platform",
      "payment processing platform",
      "payment reconciliation platform",
      "payment reconciliation",
      "financial ledger system",
      "audit ledger",
      "wallet platform",
      "transaction processing platform",
      "financial infrastructure",
      "banking platform",
      "settlement platform",
      "double-entry ledger",
      "event-driven payment reconciliation",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  /*
  |--------------------------------------------------------------------------
  | Payment-provider evidence.
  |--------------------------------------------------------------------------
  */
  if (
    hasPaymentDependency &&
    hasPaymentImport
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected payment-provider dependency used directly in source code",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasPaymentImport
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected direct payment-provider imports",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasPaymentDependency
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected payment-provider dependencies",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Structural financial-domain evidence.
  |--------------------------------------------------------------------------
  */
  if (
    financialCapabilityCount >= 2
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected multiple implemented financial processing domains",
      55,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasLedgerStructure &&
    (
      hasPaymentStructure ||
      hasReconciliationStructure ||
      hasSettlementStructure
    )
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected implemented ledger and payment lifecycle architecture",
      50,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Source-code financial behaviour.
  |--------------------------------------------------------------------------
  */
  if (
    hasFinancialCode &&
    financialCapabilityCount >= 2
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected implemented ledger, transaction, payment, wallet, reconciliation, or settlement logic",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (hasPaymentSafetyCode) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected payment safety controls including idempotency or webhook signature verification",
      25,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  /*
  |--------------------------------------------------------------------------
  | Purpose language can strengthen structural evidence, but must not
  | classify an empty repository by itself.
  |--------------------------------------------------------------------------
  */
  if (
    hasStrongFintechPurpose &&
    (
      financialCapabilityCount >= 2 ||
      hasFinancialCode ||
      hasPaymentImport
    )
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Repository purpose explicitly describes a fintech, payment, ledger, wallet, or reconciliation product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};