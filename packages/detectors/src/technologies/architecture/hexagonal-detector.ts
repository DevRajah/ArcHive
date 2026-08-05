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

export const detectHexagonalTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture([
        findSignal(
          context,
          "Ports",
          "ports",
          25,
          [
            /\/ports?\//,
            /\.port\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Adapters",
          "adapters",
          25,
          [
            /\/adapters?\//,
            /\.adapter\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Inbound adapters",
          "inbound",
          15,
          [
            /\/inbound\//,
            /primary[-_.]?adapter/,
            /driving[-_.]?adapter/,
          ],
        ),

        findSignal(
          context,
          "Outbound adapters",
          "outbound",
          15,
          [
            /\/outbound\//,
            /secondary[-_.]?adapter/,
            /driven[-_.]?adapter/,
          ],
        ),

        findSignal(
          context,
          "Application core",
          "application-core",
          20,
          [
            /\/application\//,
            /\/core\//,
            /\/use[-_.]?cases?\//,
          ],
        ),

        findSignal(
          context,
          "Domain layer",
          "domain",
          20,
          [
            /\/domain\//,
          ],
        ),
      ]);

    registerArchitecture(
      context,
      "Hexagonal Architecture",
      result,
    );
  };