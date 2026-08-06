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
    const normalizedPath =
      file
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

  const hasLedgerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)ledgers?\//,
        /(^|\/)journal-entries?\//,
        /(^|\/)accounts?\//,
        /(^|\/)double-entry\//,
        /\.ledger\.(ts|js|py)$/,
        /\.journal-entry\.(ts|js|py)$/,
      ],
    );

  const hasPaymentStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)payments?\//,
        /(^|\/)payment-providers?\//,
        /(^|\/)payment-gateways?\//,
        /(^|\/)payment-webhooks?\//,
        /\.payment\.(ts|js|py)$/,
        /\.payment-provider\.(ts|js|py)$/,
      ],
    );

  const hasReconciliationStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)reconciliation\//,
        /(^|\/)reconciliations?\//,
        /(^|\/)settlements?\//,
        /(^|\/)disputes?\//,
        /(^|\/)chargebacks?\//,
        /\.reconciliation\.(ts|js|py)$/,
        /\.settlement\.(ts|js|py)$/,
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
        /\.wallet\.(ts|js|py)$/,
        /\.transfer\.(ts|js|py)$/,
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
      ],
    );

  const financialCapabilityCount = [
    hasLedgerStructure,
    hasPaymentStructure,
    hasReconciliationStructure,
    hasWalletOrBalanceStructure,
    hasFinancialAuditStructure,
  ].filter(Boolean).length;

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
        );
    });

  const hasStrongFintechPurpose =
    [
      "fintech platform",
      "payment processing platform",
      "payment reconciliation platform",
      "financial ledger system",
      "wallet platform",
      "transaction processing platform",
      "financial infrastructure",
      "banking platform",
      "settlement platform",
      "double-entry ledger",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

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

  if (
    hasLedgerStructure &&
    (
      hasReconciliationStructure ||
      hasPaymentStructure ||
      hasWalletOrBalanceStructure
    )
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected financial ledger with payment, reconciliation, settlement, or wallet workflows",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    financialCapabilityCount >= 3
  ) {
    addEvidence(
      "FINTECH_PLATFORM",
      "Detected multiple connected financial-processing capabilities",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

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