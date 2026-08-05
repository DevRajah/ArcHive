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

export const detectCleanArchitectureTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture([
        findSignal(
          context,
          "Domain or entities layer",
          "domain",
          20,
          [
            /\/domain\//,
            /\/entities\//,
          ],
        ),

        findSignal(
          context,
          "Application or use-case layer",
          "application",
          25,
          [
            /\/application\//,
            /\/use[-_.]?cases?\//,
            /\.use-case\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Interface adapters",
          "adapters",
          20,
          [
            /\/adapters?\//,
            /\/interface-adapters?\//,
          ],
        ),

        findSignal(
          context,
          "Infrastructure layer",
          "infrastructure",
          20,
          [
            /\/infrastructure\//,
            /\/infra\//,
          ],
        ),

        findSignal(
          context,
          "Ports or boundaries",
          "ports",
          20,
          [
            /\/ports?\//,
            /\/boundaries\//,
            /\.port\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Dependency inversion interfaces",
          "interfaces",
          15,
          [
            /\/interfaces?\//,
            /repository[-_.]?interface/,
            /gateway[-_.]?interface/,
          ],
        ),
      ]);

    registerArchitecture(
      context,
      "Clean Architecture",
      result,
    );
  };