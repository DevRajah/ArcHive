import type {
  CapabilityContext,
} from "./types";

import {
  hasRealtimeEvidence,
} from "../realtime-evidence";

export const detectRealtimeCapability = (
  context: CapabilityContext,
) => {
  const {
    combinedText,
    addCapability,
  } = context;

  if (
    hasRealtimeEvidence(
      combinedText,
    )
  ) {
    addCapability(
      "REALTIME_SYSTEMS",
      92,
      "Repository supports realtime communication or live event updates."
    );
  }
};