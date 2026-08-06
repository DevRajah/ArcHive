import type {
  EvidenceContext,
} from "../evidence-types";

const COMMERCE_PACKAGES = [
  "@medusajs/medusa",
  "@medusajs/client",
  "@shopify/shopify-api",
  "@shopify/hydrogen",
  "commerce",
  "@stripe/stripe-js",
  "stripe",
  "paypal-rest-sdk",
  "@paypal/paypal-server-sdk",
  "square",
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
 * Detects genuine e-commerce products.
 *
 * Future me:
 * Generic entities such as product, order, payment, inventory, or catalogue
 * can exist in many unrelated systems. E-commerce requires multiple connected
 * commerce workflows such as catalogue, cart, checkout, orders, fulfilment,
 * inventory, or customer purchasing.
 */
export const detectEcommerceEvidence = (
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

  const hasCommerceDependency =
    hasAnySetValue(
      dependencies,
      COMMERCE_PACKAGES,
    );

  const hasCommerceImport =
    hasAnySetValue(
      imports,
      COMMERCE_PACKAGES,
    );

  const hasCatalogueStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)products?\//,
        /(^|\/)catalog(?:ue)?\//,
        /(^|\/)categories?\//,
        /(^|\/)collections?\//,
        /\.product\.(ts|js|py)$/,
      ],
    );

  const hasCartCheckoutStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)carts?\//,
        /(^|\/)checkout\//,
        /(^|\/)basket\//,
        /(^|\/)shipping\//,
        /(^|\/)delivery\//,
        /\.cart\.(ts|js|py)$/,
        /\.checkout\.(ts|js|py)$/,
      ],
    );

  const hasOrderStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)orders?\//,
        /(^|\/)fulfilment\//,
        /(^|\/)fulfillment\//,
        /(^|\/)returns?\//,
        /(^|\/)refunds?\//,
        /\.order\.(ts|js|py)$/,
      ],
    );

  const hasInventoryStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)inventory\//,
        /(^|\/)stock\//,
        /(^|\/)warehouses?\//,
        /\.inventory\.(ts|js|py)$/,
        /\.stock\.(ts|js|py)$/,
      ],
    );

  const commerceCapabilityCount = [
    hasCatalogueStructure,
    hasCartCheckoutStructure,
    hasOrderStructure,
    hasInventoryStructure,
  ].filter(Boolean).length;

  const hasCommerceCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "add to cart",
        "checkout session",
        "order item",
        "inventory quantity",
        "shipping address",
        "billing address",
        "product variant",
        "order fulfilment",
        "order fulfillment",
        "shopping cart",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongCommercePurpose =
    [
      "e-commerce platform",
      "ecommerce platform",
      "online store",
      "online marketplace",
      "shopping platform",
      "retail commerce platform",
      "product catalogue and checkout",
      "digital commerce platform",
      "storefront application",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasCommerceDependency &&
    hasCommerceImport
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Detected commerce-platform dependency used directly in source code",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasCommerceImport
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Detected direct commerce-platform or payment-provider imports",
      20,
      "IMPORT",
      "STRONG",
    );
  }

  if (
    commerceCapabilityCount >= 3
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Detected connected catalogue, cart, checkout, order, fulfilment, or inventory capabilities",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasCartCheckoutStructure &&
    (
      hasCatalogueStructure ||
      hasOrderStructure
    )
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Detected customer purchasing workflow across catalogue, cart, checkout, or orders",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasCommerceCode &&
    commerceCapabilityCount >= 2
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Detected implemented shopping, checkout, inventory, and order-processing concepts",
      35,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongCommercePurpose &&
    (
      commerceCapabilityCount >= 2 ||
      hasCommerceCode
    )
  ) {
    addEvidence(
      "ECOMMERCE_PLATFORM",
      "Repository purpose explicitly describes an e-commerce, retail, or storefront product",
      25,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};