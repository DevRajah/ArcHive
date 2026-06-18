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
];

export const runTechnologyDetectors = (context: Parameters<TechnologyDetector>[0]) => {
    for (const detector of technologyDetectors) {
        detector(context);
    }
};