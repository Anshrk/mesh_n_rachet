import time
from models import Task
from fabric import CognitionFabric
from agent import Agent
from chaos import ChaosInjector

def run_simulation():
    print("="*70)
    print(" 🚀 INITIALIZING COGNITION FABRIC DEMONSTRATION ")
    print("="*70)

    # 1. Initialize Fabric (In-memory SQLite for demo purposes)
    fabric = CognitionFabric(db_path=":memory:")

    # 2. Initialize Agents
    agent_a = Agent(agent_id="Agent_A_Alpha", fabric=fabric)
    agent_b = Agent(agent_id="Agent_B_Beta", fabric=fabric)

    chaos = ChaosInjector(fabric)

    print("\n" + "="*70)
    print(" ➔ PHASE 1: NOVEL PROBLEM DISCOVERY ")
    print("="*70)
    task1 = Task(id="api_timeout", description="Payment API timeout during high load", context={"service": "payments"})
    
    # Agent A encounters the problem for the first time
    agent_a.handle_task(task1)

    time.sleep(1)
    print("\n" + "="*70)
    print(" ➔ PHASE 2: THE RATCHET EFFECT ")
    print("="*70)
    # Agent B encounters the SAME problem. It should NOT solve it again, but reuse Fabric memory.
    agent_b.handle_task(task1)

    time.sleep(1)
    print("\n" + "="*70)
    print(" ➔ PHASE 3: BONUS CHALLENGE - GUARDRAIL DEFENSE ")
    print("="*70)
    # Chaos Injector attempts a poisoning attack
    chaos.inject_poisoned_update()
    
    time.sleep(1)
    # Chaos Injector attempts a hallucination attack
    chaos.inject_hallucination()

    time.sleep(1)
    print("\n" + "="*70)
    print(" ➔ PHASE 4: ACCELERATOR MECHANISM (BROADCAST) ")
    print("="*70)
    # Agent B encounters a new problem and solves it
    task2 = Task(id="data_missing", description="User profile data missing", context={"service": "users"})
    agent_b.handle_task(task2)
    
    time.sleep(1)
    # Agent A encounters it later. Since Agent B solved it and Fabric broadcasted it, 
    # Agent A should have it in its LOCAL memory already.
    agent_a.handle_task(task2)

    print("\n" + "="*70)
    print(" 🎉 SIMULATION COMPLETE. THE FABRIC HELD. ")
    print("="*70)

if __name__ == "__main__":
    run_simulation()
