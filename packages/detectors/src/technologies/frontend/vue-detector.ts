import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectVueTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "vue",
            "createapp",
            ".vue"
        ])
    ) {

        context.addTechnology(
            "Vue",
            "Detected Vue application framework.",
            20,
            "STRONG"
        );

    }

};