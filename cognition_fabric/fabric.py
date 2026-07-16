import sqlite3
import json
from typing import List, Callable, Optional
from models import Insight
from guardrail import AutonomousGuardrail

class CognitionFabric:
    """
    The Cognition Fabric Layer: A shared memory mechanism backed by SQLite 
    (for ledger durability) and an in-memory event bus (for the Accelerator mechanism).
    """
    def __init__(self, db_path: str = ":memory:"):
        self.db_path = db_path
        self.conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self.guardrail = AutonomousGuardrail(min_confidence=0.80)
        self.subscribers: List[Callable[[Insight], None]] = []
        self._init_db()

    def _init_db(self):
        cursor = self.conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS insights (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                problem_signature TEXT UNIQUE,
                solution TEXT,
                confidence_score REAL,
                source_agent_id TEXT,
                metadata TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        """)
        self.conn.commit()

    def subscribe(self, callback: Callable[[Insight], None]):
        """Accelerator Mechanism: Register an agent to receive real-time updates."""
        self.subscribers.append(callback)

    def publish_insight(self, insight: Insight) -> bool:
        """
        Accepts a proposed insight, validates it via Guardrails, and stores it in the Fabric.
        """
        print(f"\n[Fabric] 📩 Received proposed insight from {insight.source_agent_id} for '{insight.problem_signature}'")
        
        # 1. Guardrail Validation
        is_valid, reason = self.guardrail.validate(insight)
        if not is_valid:
            print(f"[Guardrail BLOCK] 🛑 {reason}")
            return False

        # 2. Consistency & Storage
        cursor = self.conn.cursor()
        try:
            # Upsert logic to manage Fabric Consistency at Scale (Semantic Locking/Scoped Consistency)
            cursor.execute("SELECT confidence_score FROM insights WHERE problem_signature = ?", (insight.problem_signature,))
            existing = cursor.fetchone()

            if existing:
                if existing[0] >= insight.confidence_score:
                    print(f"[Fabric Consistency] ℹ️ Ignored update. Existing solution has higher or equal confidence ({existing[0]} >= {insight.confidence_score})")
                    return True # It's not a failure, just skipped
                else:
                    print(f"[Fabric Consistency] 🔄 Upgrading existing solution for '{insight.problem_signature}'")
                    cursor.execute("""
                        UPDATE insights SET solution=?, confidence_score=?, source_agent_id=?, metadata=?
                        WHERE problem_signature=?
                    """, (insight.solution, insight.confidence_score, insight.source_agent_id, json.dumps(insight.metadata), insight.problem_signature))
            else:
                cursor.execute("""
                    INSERT INTO insights (problem_signature, solution, confidence_score, source_agent_id, metadata)
                    VALUES (?, ?, ?, ?, ?)
                """, (insight.problem_signature, insight.solution, insight.confidence_score, insight.source_agent_id, json.dumps(insight.metadata)))
            
            self.conn.commit()
            print(f"[Fabric ACCEPT] ✅ Insight for '{insight.problem_signature}' safely committed to collective memory.")

        except Exception as e:
            print(f"[Fabric ERROR] ❌ Database error: {e}")
            return False

        # 3. Accelerator Mechanism (Broadcast)
        print(f"[Fabric BROADCAST] 📡 Broadcasting insight to {len(self.subscribers)} registered nodes...")
        for subscriber in self.subscribers:
            subscriber(insight)
        
        return True

    def query_insight(self, problem_signature: str) -> Optional[Insight]:
        """Query the Fabric for an existing verified solution."""
        cursor = self.conn.cursor()
        cursor.execute("SELECT problem_signature, solution, confidence_score, source_agent_id, metadata FROM insights WHERE problem_signature = ?", (problem_signature,))
        row = cursor.fetchone()
        if row:
            return Insight(row[0], row[1], row[2], row[3], json.loads(row[4]))
        return None
