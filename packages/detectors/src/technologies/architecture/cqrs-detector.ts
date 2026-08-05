import type {
  TechnologyDetector,
} from "../types";

import {
  evaluateArchitecture,
  findSignal,
} from "./architecture-score";

import {
  registerArchitecture,
} from "./register-architecture";

export const detectCqrsTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture([
        findSignal(
          context,
          "Command definitions",
          "commands",
          25,
          [
            /\/commands?\//,
            /\.command\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Command handlers",
          "command-handlers",
          20,
          [
            /command[-_.]?handler/,
            /\.command-handler\.[jt]s$/,
            /\/handlers\/.*command/,
          ],
        ),

        findSignal(
          context,
          "Query definitions",
          "queries",
          25,
          [
            /\/queries\//,
            /\.query\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Query handlers",
          "query-handlers",
          20,
          [
            /query[-_.]?handler/,
            /\.query-handler\.[jt]s$/,
            /\/handlers\/.*query/,
          ],
        ),

        findSignal(
          context,
          "Read model implementation",
          "read-models",
          15,
          [
            /read[-_.]?model/,
            /\/read-models?\//,
            /\/projections?\//,
          ],
        ),

        findSignal(
          context,
          "Write model implementation",
          "write-models",
          15,
          [
            /write[-_.]?model/,
            /\/write-models?\//,
          ],
        ),
      ]);

    registerArchitecture(
      context,
      "CQRS",
      result,
    );
  };