import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectEcommerceEvidence = (
    context: EvidenceContext
) => {
    const { combinedText, addEvidence } = context;

    if (
        includesAny(combinedText, [
            "cart",
            "checkout",
            "order",
            "inventory",
            "catalog",
            "payment",
            "product",
            
        ])
    ) {
        addEvidence(
            "ECOMMERCE_PLATFORM",
            "Detected Ecommerce platform terminology",
            35,
            "DOMAIN_LANGUAGE",
            "STRONG"
        );
    }
};