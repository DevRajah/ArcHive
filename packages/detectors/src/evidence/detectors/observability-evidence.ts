import type {
  EvidenceContext,
} from "../evidence-types";

const OBSERVABILITY_PACKAGES = [
  "@opentelemetry/api",
  "@opentelemetry/sdk-node",
  "@opentelemetry/sdk-trace-node",
  "@opentelemetry/exporter-prometheus",
  "@opentelemetry/exporter-jaeger",
  "prom-client",
  "prometheus-client",
  "dd-trace",
  "@sentry/node",
  "@sentry/nextjs",
  "@sentry/react",
  "newrelic",
  "elastic-apm-node",
  "winston",
  "pino",
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
 * Detects repositories whose primary purpose is observability, telemetry,
 * operational monitoring, tracing, or system-health intelligence.
 *
 * Future me:
 * Logging, a /health endpoint, queue metrics, or one monitoring dependency
 * does not make an ordinary application an OBSERVABILITY_PLATFORM.
 *
 * The repository should collect, process, expose, visualise, or analyse
 * operational signals as a major product capability.
 */
export const detectObservabilityEvidence = (
  context: EvidenceContext,
): void => {
  const {
    dependencies,
    imports,
    filesChanged,
    repositoryFiles,
    configurationFiles,
    descriptiveText,
    addEvidence,
  } = context;

  const hasObservabilityDependency =
    hasAnySetValue(
      dependencies,
      OBSERVABILITY_PACKAGES,
    );

  const hasObservabilityImport =
    hasAnySetValue(
      imports,
      OBSERVABILITY_PACKAGES,
    );

  const hasTelemetryStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)telemetry\//,
        /(^|\/)observability\//,
        /(^|\/)tracing\//,
        /(^|\/)metrics\//,
        /(^|\/)instrumentation\//,
        /(^|\/)collectors?\//,
        /(^|\/)exporters?\//,
        /(^|\/)dashboards?\//,
        /(^|\/)alerts?\//,
        /\.telemetry\.[jt]s$/,
        /\.metrics\.[jt]s$/,
        /\.tracing\.[jt]s$/,
      ],
    );

  const hasObservabilityConfiguration =
    Array.from(
      configurationFiles,
    ).some((file) =>
      /prometheus|grafana|opentelemetry|otel|jaeger|loki|tempo|datadog|newrelic|elastic-apm/i.test(
        file,
      ),
    ) ||
    filesChanged.some((file) =>
      /prometheus\.ya?ml|grafana\/|otel-collector|opentelemetry|jaeger|loki|tempo/i.test(
        file,
      ),
    );

  const hasTelemetryProcessingCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "meterprovider",
        "tracerprovider",
        "createmeter",
        "startspan",
        "histogram",
        "counter.add",
        "metrics exporter",
        "trace exporter",
        "prometheus registry",
        "distributed tracing",
        "telemetry collector",
        "runtime metrics",
        "alert rule",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 2;
    });

  const hasMonitoringProductStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)monitors?\//,
        /(^|\/)incidents?\//,
        /(^|\/)alert-rules?\//,
        /(^|\/)service-health\//,
        /(^|\/)queue-monitoring\//,
        /(^|\/)worker-monitoring\//,
        /(^|\/)system-health\//,
      ],
    );

  const hasStrongObservabilityPurpose =
    [
      "observability platform",
      "telemetry platform",
      "application monitoring platform",
      "distributed tracing platform",
      "system monitoring platform",
      "infrastructure monitoring platform",
      "queue observability platform",
      "runtime monitoring platform",
      "metrics and tracing platform",
      "operational intelligence platform",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasObservabilityDependency &&
    hasObservabilityImport
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected observability dependency used directly in source code",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasObservabilityImport
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected direct telemetry, metrics, or tracing imports",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasObservabilityDependency
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected observability or telemetry dependencies",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    hasTelemetryStructure &&
    hasObservabilityConfiguration
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected observability modules with telemetry or monitoring configuration",
      40,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasTelemetryProcessingCode &&
    (
      hasTelemetryStructure ||
      hasMonitoringProductStructure
    )
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected implemented metrics, tracing, telemetry export, monitoring, or alert processing",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasMonitoringProductStructure &&
    hasObservabilityDependency
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Detected monitoring-product structure supported by observability tooling",
      30,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasStrongObservabilityPurpose &&
    (
      hasTelemetryStructure ||
      hasMonitoringProductStructure ||
      hasTelemetryProcessingCode
    )
  ) {
    addEvidence(
      "OBSERVABILITY_PLATFORM",
      "Repository purpose explicitly describes an observability, telemetry, or monitoring platform",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};