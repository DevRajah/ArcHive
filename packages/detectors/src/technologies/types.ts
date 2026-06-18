import { EvidenceContext } from "../evidence";

export type TechnologyDetector = (
    context: EvidenceContext
) => void;