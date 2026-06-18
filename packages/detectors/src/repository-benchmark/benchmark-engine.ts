import { EngineeringQualityResult } from "../engineering-quality";
import { ProductionReadiness } from "../production-readiness";
import { RepositoryHealth } from "../repository-health";
import { RepositoryMaturity } from "../maturity";
import { TechnicalDebtReport } from "../technical-debt";
import { RepositoryBenchmarkReport, BenchmarkArea } from "./types";

type BenchmarkRepositoryInput = {
  name: string;
  engineeringQuality: EngineeringQualityResult;
  productionReadiness: ProductionReadiness;
  repositoryHealth: RepositoryHealth;
  repositoryMaturity: RepositoryMaturity;
  technicalDebt: TechnicalDebtReport;
  strengths?: string[];
};

const compareArea = (
  area: string,
  leftScore: number,
  rightScore: number
): BenchmarkArea => {
  let winner: BenchmarkArea["winner"] = "TIE";

  if (leftScore > rightScore) {
    winner = "LEFT";
  }

  if (rightScore > leftScore) {
    winner = "RIGHT";
  }

  return {
    area,
    leftScore,
    rightScore,
    winner,
  };
};

const determineOverallWinner = (
  areas: BenchmarkArea[]
): RepositoryBenchmarkReport["overallWinner"] => {
  const leftWins = areas.filter((area) => area.winner === "LEFT").length;
  const rightWins = areas.filter((area) => area.winner === "RIGHT").length;

  if (leftWins > rightWins) {
    return "LEFT";
  }

  if (rightWins > leftWins) {
    return "RIGHT";
  }

  return "TIE";
};

export const benchmarkRepositories = ({
  left,
  right,
}: {
  left: BenchmarkRepositoryInput;
  right: BenchmarkRepositoryInput;
}): RepositoryBenchmarkReport => {
  const areas: BenchmarkArea[] = [
    compareArea(
      "Engineering Quality",
      left.engineeringQuality.overallScore,
      right.engineeringQuality.overallScore
    ),
    compareArea(
      "Repository Health",
      left.repositoryHealth.score,
      right.repositoryHealth.score
    ),
    compareArea(
      "Repository Maturity",
      left.repositoryMaturity.score,
      right.repositoryMaturity.score
    ),
    compareArea(
      "Production Readiness",
      left.productionReadiness.score,
      right.productionReadiness.score
    ),
    compareArea(
      "Technical Debt Control",
      100 - left.technicalDebt.debtScore,
      100 - right.technicalDebt.debtScore
    ),
  ];

  const overallWinner = determineOverallWinner(areas);

  const strengthsComparison: string[] = [];

  if (left.strengths?.length) {
    strengthsComparison.push(
      `${left.name} shows strengths in: ${left.strengths.slice(0, 5).join(", ")}.`
    );
  }

  if (right.strengths?.length) {
    strengthsComparison.push(
      `${right.name} shows strengths in: ${right.strengths.slice(0, 5).join(", ")}.`
    );
  }

  const summary =
    overallWinner === "LEFT"
      ? `${left.name} is stronger overall across the benchmarked engineering dimensions.`
      : overallWinner === "RIGHT"
        ? `${right.name} is stronger overall across the benchmarked engineering dimensions.`
        : `${left.name} and ${right.name} are closely matched across the benchmarked engineering dimensions.`;

  return {
    overallWinner,
    areas,
    strengthsComparison,
    summary,
  };
};