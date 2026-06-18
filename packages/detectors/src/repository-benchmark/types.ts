export type BenchmarkArea = {
  area: string;
  leftScore: number;
  rightScore: number;
  winner: "LEFT" | "RIGHT" | "TIE";
};

export type RepositoryBenchmarkReport = {
  overallWinner: "LEFT" | "RIGHT" | "TIE";
  areas: BenchmarkArea[];
  strengthsComparison: string[];
  summary: string;
};