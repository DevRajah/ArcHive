export const inferEngineeringTrajectory = ({
  domains,
  repositoryTypes,
}: {
  domains: string[];
  repositoryTypes: string[];
}) => {
  if (
    domains.includes("REALTIME_SYSTEMS") &&
    domains.includes("QUEUE_INFRASTRUCTURE")
  ) {
    return {
      trajectory: "DISTRIBUTED_SYSTEMS_EXPANSION",
      label: "Distributed Systems Expansion",
      description:
        "The repository is evolving toward distributed asynchronous infrastructure.",
    };
  }

  if (
    repositoryTypes.includes(
      "ENGINEERING_INTELLIGENCE_PLATFORM"
    )
  ) {
    return {
      trajectory:
        "ENGINEERING_REASONING_EXPANSION",
      label: "Engineering Reasoning Expansion",
      description:
        "The repository is evolving toward architecture intelligence and repository reasoning.",
    };
  }

  return {
    trajectory: "GENERAL_ENGINEERING_GROWTH",
    label: "General Engineering Growth",
    description:
      "The repository currently shows broad engineering evolution.",
    };
};