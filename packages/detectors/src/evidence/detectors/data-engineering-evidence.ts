import { EvidenceContext } from "../evidence-types";
import { includesAny } from "../evidence-utils";

export const detectDataEngineeringEvidence = (context: EvidenceContext) => {
  const { combinedText, addEvidence } = context;

  if (
    includesAny(combinedText, [
      "airflow",
      "dbt",
      "spark",
      "pyspark",
      "kafka",
    ])
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected data engineering framework or workflow orchestration dependency",
      35,
      "DEPENDENCY",
      "STRONG"
    );
  }

  if (
    includesAny(combinedText, [
      "etl",
      "elt",
      "data warehouse",
      "snowflake",
      "bigquery",
      "data lake",
    ])
  ) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected ETL, warehouse, or data lake architecture evidence",
      30,
      "ARCHITECTURE_PATTERN",
      "STRONG"
    );
  }

  if (includesAny(combinedText, ["batch pipeline", "stream processing"])) {
    addEvidence(
      "DATA_ENGINEERING_PROJECT",
      "Detected batch or stream processing pipeline evidence",
      25,
      "ARCHITECTURE_PATTERN",
      "MEDIUM"
    );
  }
};