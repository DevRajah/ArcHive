"use client";

import { Award } from "lucide-react";

import {
    Card,
    CardContent,
} from "@/components/ui/card";

interface Props {
    architecture: number | null;
    engineering: number | null;
    production: number | null;
    maturity: number | null;
    risk: number | null;
}

function calculateScore(
    architecture: number | null,
    engineering: number | null,
    production: number | null,
    maturity: number | null,
    risk: number | null,
) {
    const scores = [
        architecture,
        engineering,
        production,
        maturity,
        risk === null ? null : 100 - risk,
    ].filter(
        (value): value is number => value !== null,
    );

    if (scores.length === 0) {
        return 0;
    }

    return Math.round(
        scores.reduce((sum, value) => sum + value, 0) /
        scores.length,
    );
}

function grade(score: number) {

    if (score >= 95) return "A+";
    if (score >= 90) return "A";
    if (score >= 80) return "B";
    if (score >= 70) return "C";

    return "D";
}

export default function EngineeringScoreCard({
    architecture,
    engineering,
    production,
    maturity,
    risk,
}: Props) {

    const score = calculateScore(
        architecture,
        engineering,
        production,
        maturity,
        risk
    );

    return (

        <Card className="overflow-hidden">

            <CardContent className="space-y-6 p-8">

                <div className="flex items-center justify-between">

                    <div>

                        <p className="text-sm uppercase tracking-wide text-muted-foreground">
                            Overall Engineering Score
                        </p>

                        <h1 className="mt-2 text-7xl font-black">
                            {score}
                        </h1>

                        <p className="mt-2 text-lg font-semibold">
                            Grade {grade(score)}
                        </p>

                    </div>

                    <div className="rounded-2xl bg-primary/10 p-6">
                        <Award className="h-10 w-10 text-primary" />
                    </div>

                </div>

                <div className="h-4 overflow-hidden rounded-full bg-muted">

                    <div
                        className="h-full rounded-full bg-primary transition-all duration-700"
                        style={{
                            width: `${score}%`
                        }}
                    />

                </div>

                <div className="grid gap-3 md:grid-cols-5">

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Architecture
                        </p>

                        <p className="font-bold">
                            {architecture ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Engineering
                        </p>

                        <p className="font-bold">
                            {engineering ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Production
                        </p>

                        <p className="font-bold">
                            {production ?? "N/A"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Maturity
                        </p>

                        <p className="font-bold">
                            {maturity ?? "N/A"}

                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-muted-foreground">
                            Risk
                        </p>

                        <p className="font-bold">
                            {risk ?? "N/A"}
                        </p>
                    </div>

                </div>

            </CardContent>

        </Card>

    );

}