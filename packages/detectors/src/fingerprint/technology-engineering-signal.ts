import {
  EngineeringSignals,
} from "../constants";

/**
 * Some concrete technologies imply higher-level engineering behaviour.
 *
 * Future me:
 * Keep concrete implementation names inside the technology inventory.
 * Cross-cutting engineering behaviour belongs in engineeringSignals.
 *
 * Example:
 *   express-rate-limit -> technology
 *   RATE_LIMITING      -> engineering signal
 */
export const getEngineeringSignalsForTechnology = (
  technologyName: string,
): string[] => {
  if (
    technologyName ===
    "express-rate-limit"
  ) {
    return [
      EngineeringSignals.RATE_LIMITING,
    ];
  }

  return [];
};