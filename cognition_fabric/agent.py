import time
from models import Task, Insight
from fabric import CognitionFabric

class Agent:
    def __init__(self, agent_id: str, fabric: CognitionFabric):
        self.agent_id = agent_id
        self.fabric = fabric
        # Local state cache
        self.local_memory = {}
        # Subscribe to Fabric updates (Accelerator Mechanism)
        self.fabric.subscribe(self.on_fabric_update)

    def on_fabric_update(self, insight: Insight):
        # We don't need to re-learn what we just broadcasted
        if insight.source_agent_id != self.agent_id:
            print(f"[{self.agent_id}] Local Context Updated: Learned solution for '{insight.problem_signature}' via Fabric broadcast.")
            self.local_memory[insight.problem_signature] = insight

    def handle_task(self, task: Task):
        print(f"\n--- [{self.agent_id}] Processing Task: '{task.description}' ---")
        
        # 1. Check Local Memory
        if task.id in self.local_memory:
            print(f"[{self.agent_id}] Fast Path: Reusing locally cached solution for '{task.id}'")
            self._apply_solution(task.id, self.local_memory[task.id].solution)
            return

        # 2. Check Global Fabric (The Ratchet Effect)
        print(f"[{self.agent_id}] Checking Cognition Fabric for existing insights...")
        insight = self.fabric.query_insight(task.id)
        
        if insight:
            print(f"[{self.agent_id}] RATCHET EFFECT TRIGGERED! Found verified solution from {insight.source_agent_id} in global memory.")
            self.local_memory[task.id] = insight # Cache locally
            self._apply_solution(task.id, insight.solution)
            return

        # 3. Novel Problem: Solve it
        print(f"[{self.agent_id}] Novel problem detected. Engaging local reasoning...")
        time.sleep(1) # Simulate thinking/computation
        solution, confidence = self._generate_solution(task)
        self._apply_solution(task.id, solution)

        # 4. Propose to Fabric
        new_insight = Insight(
            problem_signature=task.id,
            solution=solution,
            confidence_score=confidence,
            source_agent_id=self.agent_id,
            metadata={"task_context": task.context}
        )
        print(f"[{self.agent_id}] Proposing new insight to Fabric...")
        self.fabric.publish_insight(new_insight)

    def _generate_solution(self, task: Task):
        # Mock logic to generate a solution based on task type
        if "timeout" in task.description.lower():
            return "Implement exponential backoff with jitter (max_retries=5).", 0.95
        if "missing" in task.description.lower():
            return "Add null-check guard clauses before rendering UI components.", 0.90
        return "Generic fallback procedure applied.", 0.70

    def _apply_solution(self, signature: str, solution: str):
        print(f"[{self.agent_id}] 🛠️ Executing solution for '{signature}': {solution}")
