from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class Task:
    id: str
    description: str
    context: Dict[str, Any]

@dataclass
class Insight:
    problem_signature: str
    solution: str
    confidence_score: float
    source_agent_id: str
    metadata: Dict[str, Any]
