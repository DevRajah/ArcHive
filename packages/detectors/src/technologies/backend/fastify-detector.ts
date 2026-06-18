import { TechnologyDetector } from "../types";
import { hasKeyword } from "../technology-context";

export const detectFastifyTechnology: TechnologyDetector = (
    context
) => {

    if (
        hasKeyword(context, [
            "fastify",
            "fastifyinstance",
            "@fastify",
            "reply.send"
        ])
    ) {

        context.addTechnology(
            "Fastify",
            "Detected Fastify application framework.",
            20,
            "STRONG"
        );

    }

};