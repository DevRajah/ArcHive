import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectTransportEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "gtfs",
      "transit feed",
      "trip update",
      "vehicle position",
      "vehicle tracking",
    ])
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected GTFS, transit feed, or vehicle tracking evidence",
      35,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "delay prediction",
      "arrival prediction",
      "eta prediction",
      "journey planner",
      "route optimization",
    ])
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected transport prediction, journey planning, or route optimization evidence",
      35,
      "DOMAIN_LANGUAGE",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, ["bus stop", "train station", "fleet dispatch"])
  ) {
    addEvidence(
      "SMART_TRANSPORT_PLATFORM",
      "Detected transport operations terminology",
      25,
      "DOMAIN_LANGUAGE",
      "MEDIUM"
    );
  }
};