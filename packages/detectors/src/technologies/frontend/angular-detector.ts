import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectAngularTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "@angular",
            "angular.json",
            "ngmodule"
        ])
    ) {

        context.addTechnology(
            "Angular",
            "Detected Angular application framework.",
            20,
            "STRONG"
        );

    }

};