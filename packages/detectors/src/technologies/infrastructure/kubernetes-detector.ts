import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectKubernetesTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "kubernetes",
            "kubectl",
            "deployment.yaml",
            "service.yaml",
            "ingress"
        ])
    ) {

        context.addTechnology(
            "Kubernetes",
            "Detected Kubernetes orchestration.",
            30,
            "STRONG"
        );

    }

};