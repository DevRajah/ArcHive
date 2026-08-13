import {
  EngineeringSignals,
} from "../constants";

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