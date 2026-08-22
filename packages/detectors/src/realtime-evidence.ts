import {
  includesAny,
} from "./evidence/evidence-utils";

/**
 * Canonical realtime implementation/evidence vocabulary.
 *
 * Future me:
 * Realtime capability detection and realtime architecture-domain detection
 * must use the same evidence rule. Do not let these drift independently.
 */
export const REALTIME_EVIDENCE_TERMS = [
  "socket.io",
  "websocket",
  "server-sent events",
  "socket-emitter",
  "socket.on",
  "socket.emit",
];

/**
 * Returns true when repository evidence indicates realtime communication
 * or live event-delivery infrastructure.
 */
export const hasRealtimeEvidence = (
  value: string,
): boolean => {
  return includesAny(
    value,
    REALTIME_EVIDENCE_TERMS,
  );
};