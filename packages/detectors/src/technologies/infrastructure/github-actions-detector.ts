import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectGitHubActionsTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            ".github/workflows",
            "uses:",
            "github actions",
            "workflow_dispatch"
        ])
    ) {

        context.addTechnology(
            "GitHub Actions",
            "Detected GitHub Actions CI/CD workflows.",
            20,
            "STRONG"
        );

    }

};