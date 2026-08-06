import type {
  EvidenceContext,
} from "../evidence-types";

const TRANSPORT_PACKAGES = [
  "gtfs",
  "gtfs-realtime-bindings",
  "@mapbox/mapbox-sdk",
  "@googlemaps/google-maps-services-js",
  "mapbox-gl",
  "leaflet",
  "graphhopper-js-client",
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
 * Detects public-transport, mobility, journey-planning, fleet,
 * routing, and transit-intelligence platforms.
 *
 * Future me:
 * Generic words such as route, trip, station, delay, ETA, vehicle,
 * or tracking can appear in delivery, logistics, maps, and ordinary apps.
 *
 * Smart transport classification requires connected transport-domain
 * structure, routing or prediction logic, transit standards, or a clearly
 * implemented mobility workflow.
 */
export const detectTransportEvidence = (
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

  const hasTransportDependency =
    hasAnySetValue(
      dependencies,
      TRANSPORT_PACKAGES,
    );

  const hasTransportImport =
    hasAnySetValue(
      imports,
      TRANSPORT_PACKAGES,
    );

  const hasTransitFeedStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)gtfs\//,
        /(^|\/)transit-feeds?\//,
        /(^|\/)trip-updates?\//,
        /(^|\/)vehicle-positions?\//,
        /(^|\/)service-alerts?\//,
        /gtfs[-_.]?realtime/,
        /\.trip-update\.(ts|js|py)$/,
        /\.vehicle-position\.(ts|js|py)$/,
      ],
    );

  const hasRoutingStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)routing\//,
        /(^|\/)routes\/.*planner/,
        /(^|\/)journey-planner\//,
        /(^|\/)pathfinding\//,
        /(^|\/)route-optimization\//,
        /(^|\/)route-optimisation\//,
        /(^|\/)graphs?\//,
        /\.route-planner\.(ts|js|py)$/,
        /\.dijkstra\.(ts|js|py)$/,
        /\.astar\.(ts|js|py)$/,
      ],
    );

  const hasDelayPredictionStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)delay-prediction\//,
        /(^|\/)arrival-prediction\//,
        /(^|\/)eta-prediction\//,
        /(^|\/)delay-events?\//,
        /(^|\/)disruptions?\//,
        /(^|\/)service-delays?\//,
        /\.delay\.(ts|js|py)$/,
        /\.prediction\.(ts|js|py)$/,
      ],
    );

  const hasTransportOperationsStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)vehicles?\//,
        /(^|\/)fleets?\//,
        /(^|\/)stops?\//,
        /(^|\/)stations?\//,
        /(^|\/)journeys?\//,
        /(^|\/)timetables?\//,
        /(^|\/)dispatch\//,
        /\.vehicle\.(ts|js|py)$/,
        /\.station\.(ts|js|py)$/,
        /\.journey\.(ts|js|py)$/,
      ],
    );

  const transportCapabilityCount = [
    hasTransitFeedStructure,
    hasRoutingStructure,
    hasDelayPredictionStructure,
    hasTransportOperationsStructure,
  ].filter(Boolean).length;

  const hasTransportCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "vehicle position",
        "trip update",
        "service alert",
        "arrival prediction",
        "delay prediction",
        "journey planner",
        "route optimisation",
        "route optimization",
        "bus stop",
        "train station",
        "scheduled arrival",
        "estimated arrival",
        "fleet dispatch",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasRoutingAlgorithmCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      return (
        (
          content.includes("dijkstra") ||
          content.includes("a* search") ||
          content.includes("astar")
        ) &&
        (
          content.includes("route") ||
          content.includes("journey") ||
          content.includes("station") ||
          content.includes("stop")
        )
      );
    });

  const hasStrongTransportPurpose =
    [
      "smart transport platform",
      "public transport platform",
      "transit intelligence platform",
      "journey planning platform",
      "delay prediction platform",
      "transport routing engine",
      "mobility platform",
      "fleet management platform",
      "vehicle tracking platform",
      "arrival prediction system",
      "public transit application",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasTransportDependency &&
    hasTransportImport
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected transport, GTFS, mapping, or routing dependency used directly in source code",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasTransportImport
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected direct transport, GTFS, mapping, or routing imports",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasTransportDependency
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected transport, mapping, or routing dependencies",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    transportCapabilityCount >= 3
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected connected transit feeds, routing, delay prediction, and transport-operation capabilities",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasRoutingStructure &&
    (
      hasDelayPredictionStructure ||
      hasTransportOperationsStructure
    )
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected journey routing with delay prediction or transport-operation workflows",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasTransportCode &&
    transportCapabilityCount >= 2
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected implemented transit feeds, vehicle tracking, journey planning, delay prediction, or arrival estimation",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (hasRoutingAlgorithmCode) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected route-finding algorithm applied to transport journeys, stops, or stations",
      30,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongTransportPurpose &&
    (
      transportCapabilityCount >= 2 ||
      hasTransportCode ||
      hasRoutingAlgorithmCode
    )
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Repository purpose explicitly describes a transport, transit, mobility, routing, fleet, or delay-intelligence product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};