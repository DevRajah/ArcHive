/*
|--------------------------------------------------------------------------
| Architecture Quality Engine
|--------------------------------------------------------------------------
|
| This engine measures how mature a repository's software architecture is.
|
| Unlike Engineering Quality, which evaluates implementation practices,
| Architecture Quality evaluates system design decisions.
|
| The final score ranges from 0–100.
|--------------------------------------------------------------------------
*/

import type { EngineeringQualityResult } from "./engineering-quality";
import type { RepositoryDNA } from "./dna";

export type ArchitectureQuality = {
    score: number;

    strengths: string[];

    weaknesses: string[];

    breakdown: {
        architectureBreadth: number;
        designPatterns: number;
        infrastructure: number;
        dataArchitecture: number;
        engineeringCapabilities: number;
        intelligenceConfidence: number;
        engineeringQuality: number;
    };
};

type BuildArchitectureQualityInput = {
    architectureDomains: string[];
    technologies: string[];
    engineeringSignals: string[];
    repositoryTypes: string[];

    capabilities: {
        confidence: number;
    }[];

    repositoryDNA: RepositoryDNA;

    engineeringQuality: EngineeringQualityResult;
};

const clamp = (value: number) =>
    Math.max(0, Math.min(100, Math.round(value)));

export const buildArchitectureQuality = ({
    architectureDomains,
    technologies,
    engineeringSignals,
    capabilities,
    repositoryDNA,
    engineeringQuality,
}: BuildArchitectureQualityInput): ArchitectureQuality => {

    /*
    |--------------------------------------------------------------------------
    | Architecture Breadth (20)
    |--------------------------------------------------------------------------
    */

    const breadth =
        Math.min(
            architectureDomains.length * 4,
            20
        );

    /*
    |--------------------------------------------------------------------------
    | System Design Patterns (20)
    |--------------------------------------------------------------------------
    */

    let patterns = 0;

    const has = (keyword: string) =>
        architectureDomains.includes(keyword) ||
        technologies.some(t =>
            t.toLowerCase().includes(keyword.toLowerCase())
        ) ||
        engineeringSignals.some(s =>
            s.toLowerCase().includes(keyword.toLowerCase())
        );

    if (has("QUEUE")) patterns += 4;
    if (has("EVENT")) patterns += 4;
    if (has("CACHE")) patterns += 4;
    if (has("REALTIME")) patterns += 4;
    if (has("API")) patterns += 4;

    patterns = Math.min(patterns, 20);

    /*
    |--------------------------------------------------------------------------
    | Infrastructure (15)
    |--------------------------------------------------------------------------
    */

    let infrastructure = 0;

    if (has("DOCKER")) infrastructure += 5;
    if (has("CI_CD")) infrastructure += 5;
    if (has("KUBERNETES")) infrastructure += 5;

    infrastructure = Math.min(
        infrastructure,
        15
    );

    /*
    |--------------------------------------------------------------------------
    | Data Layer (15)
    |--------------------------------------------------------------------------
    */

    let data = 0;

    if (has("DATABASE")) data += 5;
    if (has("PRISMA")) data += 5;
    if (has("MONGODB")) data += 5;

    data = Math.min(data, 15);

    /*
    |--------------------------------------------------------------------------
    | Engineering Capabilities (10)
    |--------------------------------------------------------------------------
    */

    const capabilityScore =
        capabilities.length === 0
            ? 0
            : Math.round(
                  capabilities.reduce(
                      (total, capability) =>
                          total + capability.confidence,
                      0
                  ) / capabilities.length / 10
              );

    /*
    |--------------------------------------------------------------------------
    | Intelligence Confidence (10)
    |--------------------------------------------------------------------------
    */

    const confidence =
        Math.round(
            repositoryDNA.confidenceScore / 10
        );

    /*
    |--------------------------------------------------------------------------
    | Engineering Quality Bonus (10)
    |--------------------------------------------------------------------------
    */

    const quality =
        Math.round(
            engineeringQuality.overallScore / 10
        );

    const score = clamp(
        breadth +
        patterns +
        infrastructure +
        data +
        capabilityScore +
        confidence +
        quality
    );

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (breadth >= 16)
        strengths.push(
            "Broad architectural coverage detected."
        );
    else
        weaknesses.push(
            "Limited architectural breadth."
        );

    if (patterns >= 16)
        strengths.push(
            "Uses multiple modern system design patterns."
        );
    else
        weaknesses.push(
            "Architecture patterns could be expanded."
        );

    if (infrastructure >= 10)
        strengths.push(
            "Strong infrastructure maturity."
        );

    if (data >= 10)
        strengths.push(
            "Well-defined persistence layer."
        );

    if (confidence >= 8)
        strengths.push(
            "Repository intent is clearly identifiable."
        );

    return {
        score,

        strengths,

        weaknesses,

        breakdown: {
            architectureBreadth: breadth,
            designPatterns: patterns,
            infrastructure,
            dataArchitecture: data,
            engineeringCapabilities:
                capabilityScore,
            intelligenceConfidence:
                confidence,
            engineeringQuality:
                quality,
        },
    };
};