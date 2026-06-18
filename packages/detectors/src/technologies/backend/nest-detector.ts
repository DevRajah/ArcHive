import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectNestTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "@nestjs",
            "@controller",
            "@injectable",
            "nestjs"
        ])
    ) {

        context.addTechnology(
            "NestJS",
            "Detected NestJS backend architecture.",
            20,
            "STRONG"
        );

    }

};