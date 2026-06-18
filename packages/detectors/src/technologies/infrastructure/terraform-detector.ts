import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectTerraformTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "terraform",
            ".tf",
            "terraform init",
            "terraform apply"
        ])
    ) {

        context.addTechnology(
            "Terraform",
            "Detected Infrastructure as Code using Terraform.",
            25,
            "STRONG"
        );

    }

};