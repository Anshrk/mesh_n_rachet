import { Insight } from "./models";

export class AutonomousGuardrail {
  private min_confidence: number;
  private forbidden_keywords: string[];

  constructor(min_confidence: number = 0.8) {
    this.min_confidence = min_confidence;
    this.forbidden_keywords = ["rm -rf", "drop table", "shutdown", "eval(", "exec("];
  }

  validate(insight: Insight): { valid: boolean; reason: string } {
    if (insight.confidence_score < this.min_confidence) {
      return { valid: false, reason: `Hallucination check failed: Confidence score ${insight.confidence_score.toFixed(2)} is below threshold ${this.min_confidence}` };
    }

    const solutionLower = insight.solution.toLowerCase();
    for (const keyword of this.forbidden_keywords) {
      if (solutionLower.includes(keyword)) {
        return { valid: false, reason: `Poisoning check failed: Solution contains forbidden keyword/pattern '${keyword}'` };
      }
    }

    if (!insight.problem_signature || !insight.solution) {
      return { valid: false, reason: "Validation failed: Missing problem signature or solution" };
    }

    return { valid: true, reason: "Insight validated successfully" };
  }
}
