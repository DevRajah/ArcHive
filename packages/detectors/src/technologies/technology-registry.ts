import {
    detectAngularTechnology,
    detectBullMqTechnology,
    detectExpressTechnology,
    detectFastifyTechnology,
    detectKafkaTechnology,
    detectMongoDbTechnology,
    detectMySqlTechnology,
    detectNestTechnology,
    detectNextTechnology,
    detectNodeTechnology,
    detectPostgresTechnology,
    detectRabbitMqTechnology,
    detectReactTechnology,
    detectRedisTechnology,
    detectVueTechnology,
    detectDockerTechnology,
    detectKubernetesTechnology,
    detectTerraformTechnology,
    detectGitHubActionsTechnology,

    detectAwsTechnology,
    detectAzureTechnology,
    detectGcpTechnology,
    detectVercelTechnology,
    detectRailwayTechnology,
    detectRenderTechnology,

    detectOpenAiTechnology,
    detectAnthropicTechnology,
    detectLangChainTechnology,
    detectMcpTechnology,
    detectOllamaTechnology,
} from "./index";

import {
    detectJwtTechnology,
    detectOAuthTechnology,
    detectRbacTechnology,
    detectApiKeyTechnology,
    detectEncryptionTechnology,
    detectRateLimitingTechnology,
} from "./security";

import {
    detectCypressTechnology,
    detectJestTechnology,
    detectPlaywrightTechnology,
    detectSupertestTechnology,
    detectVitestTechnology,
} from "./testing";

import {
    detectGrpcTechnology,
    detectSocketIoTechnology,
    detectSseTechnology,
    detectWebSocketTechnology,
} from "./realtime";

import {
    detectCleanArchitectureTechnology,
    detectCqrsTechnology,
    detectDddTechnology,
    detectEventDrivenTechnology,
    detectHexagonalTechnology,
    detectMicroservicesTechnology,
} from "./architecture";

import {
    detectFrameworkConfigurations,
    detectMonorepoTechnology,
} from "./configuration";

import { TechnologyDetector } from "./types";

export const technologyDetectors: TechnologyDetector[] = [
    detectNodeTechnology,
    detectExpressTechnology,
    detectFastifyTechnology,
    detectNestTechnology,

    detectReactTechnology,
    detectNextTechnology,
    detectVueTechnology,
    detectAngularTechnology,

    detectPostgresTechnology,
    detectMongoDbTechnology,
    detectMySqlTechnology,
    detectRedisTechnology,

    detectBullMqTechnology,
    detectRabbitMqTechnology,
    detectKafkaTechnology,

    detectDockerTechnology,
    detectKubernetesTechnology,
    detectTerraformTechnology,
    detectGitHubActionsTechnology,

    detectAwsTechnology,
    detectAzureTechnology,
    detectGcpTechnology,
    detectVercelTechnology,
    detectRailwayTechnology,
    detectRenderTechnology,

    detectOpenAiTechnology,
    detectAnthropicTechnology,
    detectLangChainTechnology,
    detectMcpTechnology,
    detectOllamaTechnology,

    detectJwtTechnology,
    detectOAuthTechnology,
    detectRbacTechnology,
    detectApiKeyTechnology,
    detectEncryptionTechnology,
    detectRateLimitingTechnology,

    detectJestTechnology,
    detectVitestTechnology,
    detectCypressTechnology,
    detectPlaywrightTechnology,
    detectSupertestTechnology,

    detectFrameworkConfigurations,
    detectMonorepoTechnology,

    detectSocketIoTechnology,
    detectWebSocketTechnology,
    detectSseTechnology,
    detectGrpcTechnology,

    detectMicroservicesTechnology,
    detectCqrsTechnology,
    detectEventDrivenTechnology,
    detectDddTechnology,
    detectHexagonalTechnology,
    detectCleanArchitectureTechnology,
];

export const runTechnologyDetectors = (context: Parameters<TechnologyDetector>[0]) => {
    for (const detector of technologyDetectors) {
        detector(context);
    }
};