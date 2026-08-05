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

export const detectMicroservicesTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const result =
      evaluateArchitecture(
        [
          findSignal(
            context,
            "Multiple service directories",
            "services",
            20,
            [
              /\/services\/[^/]+\//,
              /\/microservices\/[^/]+\//,
              /\/apps\/[^/]+-service\//,
            ],
          ),

          findSignal(
            context,
            "Service-specific Dockerfiles",
            "containers",
            20,
            [
              /\/services\/[^/]+\/dockerfile$/,
              /\/apps\/[^/]+\/dockerfile$/,
              /dockerfile\.[a-z0-9_-]+$/,
            ],
          ),

          findSignal(
            context,
            "API gateway",
            "gateway",
            20,
            [
              /api[-_.]?gateway/,
              /\/gateway\//,
              /gateway[-_.]service/,
            ],
          ),

          findSignal(
            context,
            "Service discovery",
            "discovery",
            15,
            [
              /service[-_.]?discovery/,
              /consul/,
              /eureka/,
            ],
          ),

          findSignal(
            context,
            "Inter-service messaging",
            "messaging",
            20,
            [
              /\/queues?\//,
              /kafka/,
              /rabbitmq/,
              /nats/,
              /event[-_.]?bus/,
            ],
          ),

          findSignal(
            context,
            "Independent deployment configuration",
            "deployment",
            20,
            [
              /\/k8s\/[^/]+-service/,
              /\/helm\/[^/]+\//,
              /\/deployments\/[^/]+\//,
            ],
          ),

          findSignal(
            context,
            "Service contracts",
            "contracts",
            15,
            [
              /\.proto$/,
              /\/contracts?\//,
              /openapi.*service/,
            ],
          ),
        ],
        70,
        4,
      );

    registerArchitecture(
      context,
      "Microservices",
      result,
    );
  };