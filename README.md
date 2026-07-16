# Phase 2: The Continuous Mesh & The Ratchet Effect

## Project Overview
This project implements a **Cognition Fabric** demonstration to address the problem of transient memory in multi-agent systems. The goal is to unlock the **ratchet effect**: a mechanism where an insight, optimization, or mitigation strategy discovered by one agent is propagated and retained by a secure, distributed mesh. This ensures the network does not have to solve the same edge-case problem repeatedly.

## Core Scenario
In current multi-agent setups, when an API session drops or a pipeline closes, immediate contextual learning vanishes. The system requires a Cognition Fabric—a distributed mesh storing collective memory—so that local breakthroughs become global knowledge safely and efficiently.

## Core Capabilities to Implement
Your implementation must demonstrate the following in a compact, credible working prototype or simulation:
1. **Dynamic Task Flow:** A flow of incoming enterprise-style tasks or incidents that forces agents to make and reuse decisions under changing conditions.
2. **Cognition Fabric Layer:** A shared memory mechanism (e.g., decentralized ledger, distributed state cache) that captures a localized breakthrough from one agent.
3. **Accelerator Mechanism:** A pipeline/mechanism that propagates a verified insight from one agent or node into shared collective memory.
4. **Autonomous Guardrail:** A verification layer that checks whether a proposed update violates policy, security, or compliance rules *before* it is accepted into the Fabric.
5. **The Ratchet Effect:** A visible demonstration of another agent, node, or later task reusing a previously captured insight.

## Bonus Challenge
**Chaos Injector:** Build a lightweight script or mechanism simulating a network fault, bad update, or policy violation. Demonstrate how the system:
- Detects the issue
- Blocks or repairs the bad propagation
- Preserves the integrity of the Fabric

## Strategic Goals & Design Dilemmas (The Final Defence)
The architecture and implementation must address and defend against the following hard dilemmas. Keep these in mind while designing the system:

1. **Validating Innovation vs. Hallucination:** 
   - *Challenge:* Distinguish between a genuine breakthrough and an invalid, convincing hallucination.
   - *Requirement:* Implement strong verification logic, consensus, or scoring before broadcasting to the global Fabric.
2. **Mitigating Cognitive Drift & Poisoning:**
   - *Challenge:* Prevent rogue or compromised agents from injecting malicious or low-quality optimizations.
   - *Requirement:* Detect, isolate, and prune poisoned cognitive updates without resetting the collective memory back to zero.
3. **Managing Fabric Consistency at Scale:**
   - *Challenge:* Handle conflicting fixes that are valid in different contexts without split-brain behavior.
   - *Requirement:* Define a clear consistency model (e.g., eventual consistency, scoped consistency, semantic locking) and handle contextual trade-offs.

## Architecture Guidelines for AI
- **Focus:** Depth matters more than breadth. Show one convincing end-to-end propagation scenario rather than sketching many features without proving them.
- **Scope:** You do not need to build an internet-scale system. A mocked architecture or local simulation is perfectly acceptable if it clearly proves the concept.

## Getting Started (Instructions for AI)
1. **Architecture Proposal:** Propose an initial architecture outlining the Agent nodes, the Fabric layer (e.g., Redis, in-memory cache, or SQLite), the Guardrail component, and the Chaos Injector.
2. **Schema Definition:** Outline the exact data schema for a "Cognitive Update" or "Insight" (e.g., condition, solution, context tags, confidence score).
3. **Core Logic:** Write the implementation for the Guardrail logic and consistency model to ensure safety and prevent poisoning.
4. **Simulation Setup:** Set up the simulated task flow to demonstrate the Ratchet Effect from start to finish.