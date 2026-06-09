export const inferRepositoryPurpose = (repositoryTypes: string[]) => {
  if (repositoryTypes.includes("FINTECH_PLATFORM")) {
    return {
      purposeType: "FINTECH",
      label: "Financial Infrastructure",
      description: "payment, ledger, reconciliation, or audit workflow infrastructure",
    };
  }

  if (repositoryTypes.includes("DEVTOOL_PLATFORM")) {
    return {
      purposeType: "DEVELOPER_TOOLING",
      label: "Developer Tooling",
      description: "CLI, scaffolding, code generation, or developer automation tooling",
    };
  }

  if (repositoryTypes.includes("OBSERVABILITY_PLATFORM")) {
    return {
      purposeType: "OBSERVABILITY",
      label: "Observability Platform",
      description: "monitoring, metrics, telemetry, or operational visibility systems",
    };
  }

  if (repositoryTypes.includes("SECURITY_PLATFORM")) {
    return {
      purposeType: "SECURITY",
      label: "Security Platform",
      description: "risk detection, anomaly detection, fraud, or security intelligence systems",
    };
  }

  if (repositoryTypes.includes("AI_ML_PROJECT")) {
    return {
      purposeType: "AI_ML",
      label: "AI / ML System",
      description: "model-driven, inference, machine learning, or AI workflow systems",
    };
  }

  if (repositoryTypes.includes("INFRASTRUCTURE_REPOSITORY")) {
    return {
      purposeType: "INFRASTRUCTURE",
      label: "Infrastructure Repository",
      description: "deployment, cloud, infrastructure-as-code, or platform operations",
    };
  }

  if (repositoryTypes.includes("MOBILE_APPLICATION")) {
    return {
      purposeType: "MOBILE",
      label: "Mobile Application",
      description: "mobile application or cross-platform mobile product architecture",
    };
  }

  return {
    purposeType: "GENERAL_SOFTWARE",
    label: "General Software Repository",
    description: "general software engineering activity",
  };
};