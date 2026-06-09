export const inferEcosystemCluster = (
  repositoryTypes: string[]
) => {
  if (
    repositoryTypes.includes("FINTECH_PLATFORM")
  ) {
    return {
      cluster: "FINTECH_ECOSYSTEM",
      label: "Financial Engineering Ecosystem",
    };
  }

  if (
    repositoryTypes.includes("OBSERVABILITY_PLATFORM")
  ) {
    return {
      cluster: "OBSERVABILITY_ECOSYSTEM",
      label: "Observability Engineering Ecosystem",
    };
  }

  if (
    repositoryTypes.includes("DEVTOOL_PLATFORM")
  ) {
    return {
      cluster: "DEVELOPER_TOOLING_ECOSYSTEM",
      label: "Developer Tooling Ecosystem",
    };
  }

  if (
    repositoryTypes.includes(
      "ENGINEERING_INTELLIGENCE_PLATFORM"
    )
  ) {
    return {
      cluster: "ENGINEERING_INTELLIGENCE_ECOSYSTEM",
      label: "Engineering Intelligence Ecosystem",
    };
  }

  return {
    cluster: "GENERAL_SOFTWARE_ECOSYSTEM",
    label: "General Software Ecosystem",
  };
};