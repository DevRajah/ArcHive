import type {
  EvidenceContext,
} from "../evidence-types";

const MESSAGE_BROKER_PACKAGES = [
  "kafkajs",
  "node-rdkafka",
  "amqplib",
  "rascal",
  "nats",
  "@nats-io/transport-node",
  "@google-cloud/pubsub",
  "@aws-sdk/client-sqs",
  "@aws-sdk/client-sns",
  "mqtt",
  "bullmq",
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
 * Detects repositories whose main purpose is messaging infrastructure,
 * event streaming, broker abstraction, pub/sub, or message delivery.
 *
 * Future me:
 * Using BullMQ, Kafka, RabbitMQ, NATS, SQS, or a queue consumer does not
 * automatically make an ordinary application a MESSAGING_PLATFORM.
 *
 * The repository must expose messaging as a core product capability.
 */
export const detectMessagingEvidence = (
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

  const hasBrokerDependency =
    hasAnySetValue(
      dependencies,
      MESSAGE_BROKER_PACKAGES,
    );

  const hasBrokerImport =
    hasAnySetValue(
      imports,
      MESSAGE_BROKER_PACKAGES,
    );

  const hasProducerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)producers?\//,
        /(^|\/)publishers?\//,
        /(^|\/)emitters?\//,
        /\.producer\.(ts|js|py)$/,
        /\.publisher\.(ts|js|py)$/,
      ],
    );

  const hasConsumerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)consumers?\//,
        /(^|\/)subscribers?\//,
        /(^|\/)handlers?\/.*message/,
        /\.consumer\.(ts|js|py)$/,
        /\.subscriber\.(ts|js|py)$/,
      ],
    );

  const hasBrokerStructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)brokers?\//,
        /(^|\/)messaging\//,
        /(^|\/)event-bus\//,
        /(^|\/)pubsub\//,
        /(^|\/)streams?\//,
        /(^|\/)topics?\//,
        /\.broker\.(ts|js|py)$/,
        /\.event-bus\.(ts|js|py)$/,
      ],
    );

  const hasDeliveryInfrastructure =
    matchesAnyPath(
      filesChanged,
      [
        /(^|\/)dead-letter\//,
        /(^|\/)dead-letter-queues?\//,
        /(^|\/)retries?\//,
        /(^|\/)message-routing\//,
        /(^|\/)schemas?\//,
        /(^|\/)contracts?\//,
        /(^|\/)outbox\//,
        /(^|\/)inbox\//,
      ],
    );

  const messagingCapabilityCount = [
    hasProducerStructure,
    hasConsumerStructure,
    hasBrokerStructure,
    hasDeliveryInfrastructure,
  ].filter(Boolean).length;

  const hasMessagingCode =
    repositoryFiles.some((file) => {
      const content =
        file.content.toLowerCase();

      const signals = [
        "message broker",
        "publish message",
        "subscribe topic",
        "consumer group",
        "dead letter queue",
        "message acknowledgement",
        "message routing",
        "delivery attempt",
        "event bus",
        "topic partition",
        "queue consumer",
        "message schema",
      ];

      return signals.filter((signal) =>
        content.includes(signal),
      ).length >= 3;
    });

  const hasStrongMessagingPurpose =
    [
      "messaging platform",
      "message broker platform",
      "event streaming platform",
      "pub/sub platform",
      "publish subscribe platform",
      "message delivery platform",
      "event bus platform",
      "stream processing platform",
      "messaging infrastructure",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    hasBrokerDependency &&
    hasBrokerImport
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected message-broker dependency used directly in source code",
      30,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasBrokerImport
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected direct message-broker or event-streaming imports",
      25,
      "IMPORT",
      "STRONG",
    );
  } else if (
    hasBrokerDependency
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected messaging or broker dependencies",
      15,
      "DEPENDENCY",
      "MEDIUM",
    );
  }

  if (
    messagingCapabilityCount >= 3
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected producers, consumers, broker infrastructure, and message-delivery controls",
      45,
      "ARCHITECTURE_PATTERN",
      "STRONG",
    );
  } else if (
    hasBrokerStructure &&
    hasProducerStructure &&
    hasConsumerStructure
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected complete broker, producer, and consumer architecture",
      40,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasMessagingCode &&
    messagingCapabilityCount >= 2
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Detected implemented message routing, publication, consumption, acknowledgement, or delivery workflows",
      40,
      "CODE_PATTERN",
      "STRONG",
    );
  }

  if (
    hasStrongMessagingPurpose &&
    (
      messagingCapabilityCount >= 2 ||
      hasMessagingCode
    )
  ) {
    addEvidence(
      "MESSAGING_PLATFORM",
      "Repository purpose explicitly describes a messaging, broker, pub/sub, or event-streaming product",
      30,
      "DOMAIN_LANGUAGE",
      "STRONG",
    );
  }
};