import { formatFilterLabel } from "@/lib/filters";

export const repositoryPurposeDescriptions: Record<string, string> = {
  ENGINEERING_INTELLIGENCE_PLATFORM:
    "Repository intelligence, engineering analytics, repository analysis and architecture intelligence platform.",

  DEVELOPER_TOOLING:
    "CLI, scaffolding, code generation, developer automation, or engineering productivity tooling.",

  FINTECH_PLATFORM:
    "Financial infrastructure, payment, ledger, reconciliation, audit, or transaction workflow platform.",

  OBSERVABILITY_PLATFORM:
    "Monitoring, metrics, logging, tracing, reliability, or operational visibility platform.",

  SECURITY_PLATFORM:
    "Authentication, authorization, access control, policy enforcement, or security-focused platform.",

  AI_ML_PROJECT:
    "Artificial intelligence, machine learning, model orchestration, inference, or data intelligence project.",

  INFRASTRUCTURE_REPOSITORY:
    "Infrastructure, deployment, cloud, Docker, Kubernetes, Terraform, or platform operations repository.",

  FRONTEND_APPLICATION:
    "User-facing frontend application with interface, routing, state, and client-side experience logic.",

  BACKEND_API_SERVICE:
    "Backend service exposing APIs, business logic, persistence, integrations, or server-side workflows.",

  MOBILE_APPLICATION:
    "Mobile application targeting phone or tablet experiences.",

  DESIGN_SYSTEM_REPOSITORY:
    "Reusable UI components, design tokens, visual language, or frontend design infrastructure.",
};

export function getPrimaryRepositoryType(identity?: {
  primaryRepositoryType?: string | null;
  repositoryTypes?: string[];
}) {
  const repositoryTypes = identity?.repositoryTypes || [];

  return identity?.primaryRepositoryType || repositoryTypes[0] || null;
}

export function getPurposeTitle(primaryType?: string | null) {
  if (!primaryType) return "General Software Repository";

  return formatFilterLabel(primaryType);
}

export function getPurposeDescription(primaryType?: string | null) {
  if (!primaryType) {
    return "ArcHive has not detected a specific repository purpose yet.";
  }

  return (
    repositoryPurposeDescriptions[primaryType] ||
    "Repository purpose was classified by ArcHive using backend intelligence signals."
  );
}