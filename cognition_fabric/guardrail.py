from models import Insight

class AutonomousGuardrail:
    """
    Autonomous Guardrail layer that checks whether a proposed update violates 
    policy, security, or compliance rules before it is accepted into the Fabric.
    """
    def __init__(self, min_confidence: float = 0.8):
        self.min_confidence = min_confidence
        # Simple policy rules for hallucination and poisoning
        self.forbidden_keywords = ["rm -rf", "drop table", "shutdown", "eval(", "exec("]

    def validate(self, insight: Insight) -> tuple[bool, str]:
        # Check 1: Innovation vs Hallucination (Confidence score threshold)
        if insight.confidence_score < self.min_confidence:
            return False, f"Hallucination check failed: Confidence score {insight.confidence_score} is below threshold {self.min_confidence}"
        
        # Check 2: Cognitive Drift & Poisoning (Policy violation)
        solution_lower = insight.solution.lower()
        for keyword in self.forbidden_keywords:
            if keyword in solution_lower:
                return False, f"Poisoning check failed: Solution contains forbidden keyword/pattern '{keyword}'"
        
        # Check 3: Schema completeness
        if not insight.problem_signature or not insight.solution:
            return False, "Validation failed: Missing problem signature or solution"

        return True, "Insight validated successfully"
