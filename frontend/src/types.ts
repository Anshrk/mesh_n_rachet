export interface Insight {
  problem_signature: string;
  solution: string;
  confidence_score: number;
  source_agent_id: string;
  metadata: any;
  timestamp?: string;
}
