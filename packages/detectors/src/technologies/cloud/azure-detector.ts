import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectAzureTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "azure",
            "azure storage",
            "azure functions",
            "azure app service"
        ])
    ) {

        context.addTechnology(
            "Microsoft Azure",
            "Detected Microsoft Azure cloud platform.",
            25,
            "STRONG"
        );

    }

};