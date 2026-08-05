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

export const detectEventDrivenTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture([
        findSignal(
          context,
          "Domain or integration events",
          "events",
          20,
          [
            /\/events\//,
            /\.event\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Event handlers",
          "handlers",
          20,
          [
            /event[-_.]?handler/,
            /\.handler\.[jt]s$/,
            /\/handlers\/.*event/,
          ],
        ),

        findSignal(
          context,
          "Event publishers or emitters",
          "publishers",
          20,
          [
            /event[-_.]?(publisher|emitter|producer)/,
            /(publisher|emitter|producer)[-_.]?event/,
          ],
        ),

        findSignal(
          context,
          "Queue or broker infrastructure",
          "broker",
          20,
          [
            /\/queues?\//,
            /\.queue\.[jt]s$/,
            /bullmq/,
            /kafka/,
            /rabbitmq/,
          ],
        ),

        findSignal(
          context,
          "Background workers",
          "workers",
          15,
          [
            /\/workers?\//,
            /\.worker\.[jt]s$/,
          ],
        ),

        findSignal(
          context,
          "Event consumers",
          "consumers",
          15,
          [
            /\/consumers?\//,
            /\.consumer\.[jt]s$/,
            /event[-_.]?consumer/,
          ],
        ),
      ]);

    registerArchitecture(
      context,
      "Event-Driven Architecture",
      result,
    );
  };