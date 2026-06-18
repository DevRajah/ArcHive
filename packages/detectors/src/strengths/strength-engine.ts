import { EngineeringQualityResult } from "../engineering-quality";
import { RepositoryMaturity } from "../maturity";
import { ProductionReadiness } from "../production-readiness";

import {
    RepositoryStrength,
    StrengthReport,
} from "./types";

export const buildStrengthReport = ({
    engineeringQuality,
    repositoryMaturity,
    productionReadiness,
}: {

    engineeringQuality: EngineeringQualityResult;

    repositoryMaturity: RepositoryMaturity;

    productionReadiness: ProductionReadiness;

}): StrengthReport => {

    const strengths: RepositoryStrength[] = [];

    engineeringQuality.scores.forEach((quality) => {

        if (quality.score >= 80) {

            strengths.push({

                category: quality.area,

                title: `${quality.area} is a repository strength`,

                description:
                    `${quality.area} scored ${quality.score}, indicating mature engineering practices.`,

                evidence: quality.reasons,

            });

        }

    });

    if (repositoryMaturity.level === "ENTERPRISE_READY") {

        strengths.push({

            category: "MATURITY",

            title: "Enterprise engineering maturity",

            description:
                "Repository demonstrates enterprise-grade engineering maturity.",

            evidence: repositoryMaturity.reasons,

        });

    }

    if (
        productionReadiness.level === "ENTERPRISE_READY" ||
        productionReadiness.level === "PRODUCTION_READY"
    ) {

        strengths.push({

            category: "PRODUCTION",

            title: "Production-ready architecture",

            description:
                "Repository demonstrates strong production readiness.",

            evidence: productionReadiness.strengths,

        });

    }

    return {

        strengths,

    };

};