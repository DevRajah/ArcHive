import { createCapabilityContext } from "./capability-context";
import { detectApiCapability } from "./api-capability";
import { detectAuthCapability } from "./auth-capability";
import { detectCacheCapability } from "./cache-capability";
import { detectDatabaseCapability } from "./database-capability";
import { detectDevopsCapability } from "./devops-capability";
import { detectObservabilityCapability } from "./observability-capability";
import { detectQueueCapability } from "./queue-capability";
import { detectRealtimeCapability } from "./realtime-capability";
import { detectTestingCapability } from "./testing-capability";

export const detectEngineeringCapabilities = ({
  filesChanged,
  commitMessages,
  repositoryContext,
}: {
  filesChanged: string[];
  commitMessages: string[];
  repositoryContext?: string;
}) => {
  const context = createCapabilityContext({
    filesChanged,
    commitMessages,
    repositoryContext,
  });

  detectApiCapability(context);
  detectAuthCapability(context);
  detectCacheCapability(context);
  detectDatabaseCapability(context);
  detectDevopsCapability(context);
  detectObservabilityCapability(context);
  detectQueueCapability(context);
  detectRealtimeCapability(context);
  detectTestingCapability(context);

  return context.capabilities.sort((a, b) => b.confidence - a.confidence);
};