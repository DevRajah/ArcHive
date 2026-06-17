

// export type RepositoryType =
//     | "JAVASCRIPT_TYPESCRIPT_PROJECT"
//     | "FRONTEND_APPLICATION"
//     | "FINTECH_PLATFORM"
//     | "DEVTOOL_PLATFORM"
//     | "DEVELOPER_PLATFORM"
//     | "OBSERVABILITY_PLATFORM"
//     | "SECURITY_PLATFORM"
//     | "COLLABORATION_PLATFORM"
//     | "SMART_TRANSPORT_PLATFORM"
//     | "ENERGY_PLATFORM"
//     | "ENGINEERING_INTELLIGENCE_PLATFORM"
//     | "AI_ML_PROJECT"
//     | "DATA_ENGINEERING_PROJECT"
//     | "MOBILE_APPLICATION"
//     | "INFRASTRUCTURE_REPOSITORY"
//     | "DESIGN_SYSTEM"
//     | "GO_SERVICE"
//     | "RUST_SERVICE"
//     | "PYTHON_SERVICE"
//     | "LARAVEL_APPLICATION"
//     | "SPRING_BOOT_SERVICE"
//     | "BACKEND_SERVICE"
//     | "DOCUMENTATION_HEAVY_REPOSITORY"
//     | "ECOMMERCE_PLATFORM"
//     | "EDUCATION_PLATFORM"
//     | "HEALTHCARE_PLATFORM"
//     | "PACKAGE_LIBRARY"
//     | "INFRASTRUCTURE_PLATFORM"
//     | "MESSAGING_PLATFORM";

import { RepositoryType } from "../constants";

export type EvidenceCategory =
    | "REPOSITORY_METADATA"
    | "FILE_STRUCTURE"
    | "DEPENDENCY"
    | "CODE_PATTERN"
    | "DOMAIN_LANGUAGE"
    | "ARCHITECTURE_PATTERN";

export type EvidenceStrength = "WEAK" | "MEDIUM" | "STRONG";

export type EvidenceItem = {
    repositoryType: RepositoryType;
    label: string;
    weight: number;
    category: EvidenceCategory;
    strength: EvidenceStrength;
};

export type EvidenceResult = {
    repositoryType: RepositoryType;
    confidence: number;
    evidence: string[];
    strongestEvidence: string[];
    totalScore: number;
};

export type EvidenceContextInput = {
    filesChanged: string[];
    commitMessages: string[];
    repositoryContext?: string;
};

export type EvidenceContext = {
    filesChanged: string[];
    commitMessages: string[];
    combinedText: string;
    evidenceItems: EvidenceItem[];
    addEvidence: (
        repositoryType: RepositoryType,
        label: string,
        weight: number,
        category: EvidenceCategory,
        strength: EvidenceStrength
    ) => void;
};

