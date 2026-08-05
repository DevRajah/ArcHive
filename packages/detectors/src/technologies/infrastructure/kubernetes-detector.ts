import type {
  TechnologyDetector,
} from "../types";

import {
  addConfirmedFileTechnology,
  findImplementationFile,
} from "../technology-context";

export const detectKubernetesTechnology:
  TechnologyDetector = (
    context,
  ) => {
    const file =
      findImplementationFile(
        context,
        [
          "kubernetes/",
          "k8s/",
          "helm/",
          "chart.yaml",
          "deployment.yaml",
          "deployment.yml",
          "ingress.yaml",
          "ingress.yml",
        ],
      );

    if (!file) {
      return;
    }

    addConfirmedFileTechnology({
      context,
      name: "Kubernetes",
      reason:
        "Detected Kubernetes or Helm configuration files.",
      file,
      source: "CONFIGURATION",
    });
  };