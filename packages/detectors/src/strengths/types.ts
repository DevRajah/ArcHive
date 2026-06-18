export type RepositoryStrength = {
    category: string;

    title: string;

    description: string;

    evidence: string[];
};

export type StrengthReport = {

    strengths: RepositoryStrength[];

};