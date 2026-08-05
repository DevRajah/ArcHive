import type {
  EvidenceContext,
} from "../../evidence";

import {
  getImplementationFiles,
} from "../technology-context";

export interface ArchitectureSignal {
  description: string;
  weight: number;
  group: string;
  matched: boolean;
  evidence?: string;
}

export interface ArchitectureEvaluationResult {
  confirmed: boolean;
  score: number;
  matchedGroups: number;
  evidence: ArchitectureSignal[];
}

/**
 * Confirms an architecture only when multiple independent signals agree.
 *
 * One matching folder or filename must never be enough.
 */
export const evaluateArchitecture = (
  signals: ArchitectureSignal[],
  minimumScore = 60,
  minimumGroups = 3,
): ArchitectureEvaluationResult => {
  const matchedSignals =
    signals.filter(
      (signal) => signal.matched,
    );

  const rawScore =
    matchedSignals.reduce(
      (total, signal) =>
        total + signal.weight,
      0,
    );

  const score =
    Math.min(100, rawScore);

  const matchedGroups =
    new Set(
      matchedSignals.map(
        (signal) => signal.group,
      ),
    ).size;

  return {
    confirmed:
      score >= minimumScore &&
      matchedGroups >= minimumGroups,

    score,
    matchedGroups,
    evidence: matchedSignals,
  };
};

/**
 * Searches implementation-oriented repository files.
 *
 * Detector source files, build output, node_modules and generated files
 * are already removed by getImplementationFiles().
 */
export const findSignal = (
  context: EvidenceContext,
  description: string,
  group: string,
  weight: number,
  matchers: Array<string | RegExp>,
): ArchitectureSignal => {
  const files =
    getImplementationFiles(context);

  for (const file of files) {
    const matched =
      matchers.some((matcher) => {
        if (
          typeof matcher === "string"
        ) {
          return file.includes(
            matcher.toLowerCase(),
          );
        }

        return matcher.test(file);
      });

    if (matched) {
      return {
        description,
        group,
        weight,
        matched: true,
        evidence: file,
      };
    }
  }

  return {
    description,
    group,
    weight,
    matched: false,
  };
};