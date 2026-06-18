import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectGcpTechnology: TechnologyDetector = (context) => {

    if (
        hasKeyword(context, [
            "google cloud",
            "gcp",
            "cloud run",
            "bigquery"
        ])
    ) {

        context.addTechnology(
            "Google Cloud",
            "Detected Google Cloud Platform infrastructure.",
            25,
            "STRONG"
        );

    }

};