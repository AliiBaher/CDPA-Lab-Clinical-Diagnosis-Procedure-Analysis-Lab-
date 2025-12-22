export interface AiAssistRequest {
  query: string;
  topK: number;
  gender?: string;  // "M" / "F"
  age?: number;     // e.g. 64
}

export interface EpisodeSummary {
  hadmId: number;
  docText: string;
}

export interface DiagnosisSummary {
  icd9Code: string;
  description: string;
  count: number;
}

export interface ProcedureSummary {
  icd9Code: string;
  description: string;
  count: number;
}

export interface DrugSummary {
  drug: string;
  count: number;
}

export interface ExampleEpisode {
  hadmId: number;
  subjectId: number;
  admitTime: string;
  dischTime: string | null;
  admissionType: string | null;
  diagnosis: string | null;
  gender: string | null;
}

export interface AiAssistResponse {
  retrievedCount: number;
  episodes: EpisodeSummary[];
  topDiagnoses: DiagnosisSummary[];
  topProcedures: ProcedureSummary[];
  topDrugs: DrugSummary[];
  exampleEpisode: ExampleEpisode | null;
  summaryText: string;
}

export interface AiAdviceRequest {
  query: string;
  topK: number;
  gender?: string;  // "M" / "F"
  age?: number;     // e.g. 64
}

export interface AiAdviceResponse {
  cohortSummary: string;
  adviceText: string;
}
