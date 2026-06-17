import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectMessagingEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "kafka",
            "rabbitmq",
            "nats",
            "event bus",
            "message broker",
            "pubsub",
            "queue consumer",
        ])
    ) {
        addEvidence(
            "MESSAGING_PLATFORM",
            "Detected messaging and event-driven platform",
            45,
            "ARCHITECTURE_PATTERN",
            "STRONG"
        );
    }
};