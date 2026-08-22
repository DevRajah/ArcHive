import type {
  CapabilityContext,
} from "./types";

/**
 * Realtime architecture requires implementation-backed evidence.
 *
 * Future me:
 * Do not infer REALTIME_SYSTEMS from generic repository prose such as
 * "realtime", "live updates", "event stream", or similar descriptions.
 *
 * The technology evidence pipeline has already evaluated dependencies,
 * imports, and dedicated implementation structures before this stage.
 */
export const detectRealtimeCapability = (
  context: CapabilityContext,
) => {
  const {
    evidenceContext,
    addCapability,
  } = context;

  const confirmedRealtimeTechnologies =
    new Set([
      "socket.io",
      "websocket",
      "server-sent events",
    ]);

  const hasConfirmedRealtimeTechnology =
    evidenceContext.technologyEvidence.some(
      (evidence) =>
        evidence.status === "CONFIRMED" &&
        confirmedRealtimeTechnologies.has(
          evidence.name
            .trim()
            .toLowerCase(),
        ),
    );

  if (!hasConfirmedRealtimeTechnology) {
    return;
  }

  addCapability(
    "REALTIME_SYSTEMS",
    92,
    "Repository contains confirmed realtime implementation technology.",
  );
};