import type {
  EvidenceContext,
} from "../evidence-types";

const INFRASTRUCTURE_PACKAGES = [
  "@pulumi/pulumi",
  "aws-cdk-lib",
  "@aws-cdk/core",
  "cdktf",
];

const hasAnySetValue = (
  values: Set<string>,
  candidates: string[],
): boolean => {
  return candidates.some((candidate) =>
    values.has(candidate.toLowerCase()),
  );
};

/**
 * Docker usage alone does not make a repository an infrastructure platform.
 *
 * This detector requires infrastructure-as-code, orchestration manifests,
 * provisioning tools, or infrastructure-dominant repository structure.
 */
export const detectInfrastructureEvidence = (
  context: EvidenceContext,
): void => {
  const {
    filesChanged,
    dependencies,
    imports,
    descriptiveText,
    addEvidence,
  } = context;

  const normalizedFiles =
    filesChanged.map((file) =>
      file.replace(/\\/g, "/").toLowerCase(),
    );

  const terraformFiles =
    normalizedFiles.filter((file) =>
      file.endsWith(".tf"),
    );

  const kubernetesFiles =
    normalizedFiles.filter((file) =>
      (
        file.includes("/k8s/") ||
        file.startsWith("k8s/") ||
        file.includes("/kubernetes/") ||
        file.startsWith("kubernetes/") ||
        file.includes("/helm/") ||
        file.startsWith("helm/") ||
        file.endsWith("chart.yaml")
      ) &&
      file.match(/\.ya?ml$/),
    );

  const provisioningFiles =
    normalizedFiles.filter((file) =>
      (
        file.includes("/ansible/") ||
        file.startsWith("ansible/") ||
        file.includes("/pulumi/") ||
        file.startsWith("pulumi/") ||
        file.includes("/cloudformation/") ||
        file.startsWith("cloudformation/")
      ),
    );

  const applicationSourceFiles =
    normalizedFiles.filter((file) =>
      /\.(ts|tsx|js|jsx|py|go|java|rs|php|cs)$/.test(
        file,
      ),
    );

  const infrastructureFileCount =
    terraformFiles.length +
    kubernetesFiles.length +
    provisioningFiles.length;

  const hasInfrastructureSdk =
    hasAnySetValue(
      dependencies,
      INFRASTRUCTURE_PACKAGES,
    ) ||
    hasAnySetValue(
      imports,
      INFRASTRUCTURE_PACKAGES,
    );

  const infrastructureDominates =
    infrastructureFileCount >= 5 &&
    infrastructureFileCount >=
      applicationSourceFiles.length;

  const hasStrongInfrastructurePurpose =
    [
      "infrastructure as code repository",
      "cloud infrastructure platform",
      "infrastructure automation",
      "kubernetes deployment platform",
      "terraform modules",
      "cloud provisioning",
    ].some((phrase) =>
      descriptiveText.includes(phrase),
    );

  if (
    terraformFiles.length >= 2
  ) {
    addEvidence(
      "INFRASTRUCTURE_PLATFORM",
      "Detected multiple Terraform infrastructure definitions",
      40,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    kubernetesFiles.length >= 3
  ) {
    addEvidence(
      "INFRASTRUCTURE_PLATFORM",
      "Detected substantial Kubernetes or Helm deployment configuration",
      35,
      "CONFIGURATION",
      "STRONG",
    );
  }

  if (
    provisioningFiles.length >= 2 ||
    hasInfrastructureSdk
  ) {
    addEvidence(
      "INFRASTRUCTURE_PLATFORM",
      "Detected infrastructure provisioning tools or SDK implementation",
      35,
      "DEPENDENCY",
      "STRONG",
    );
  }

  if (
    infrastructureDominates
  ) {
    addEvidence(
      "INFRASTRUCTURE_PLATFORM",
      "Infrastructure definitions dominate the repository structure",
      30,
      "FILE_STRUCTURE",
      "STRONG",
    );
  }

  if (
    hasStrongInfrastructurePurpose &&
    (
      terraformFiles.length >= 2 ||
      kubernetesFiles.length >= 3 ||
      provisioningFiles.length >= 2 ||
      hasInfrastructureSdk
    )
  ) {
    addEvidence(
      "INFRASTRUCTURE_PLATFORM",
      "Repository purpose explicitly describes infrastructure automation or cloud provisioning",
      20,
      "DOMAIN_LANGUAGE",
      "MEDIUM",
    );
  }
};