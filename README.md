# 🌌 Cognition Fabric: The Ratchet Effect

*A decentralized, continuously learning semantic memory mesh designed for autonomous multi-agent systems.*

## 🏆 Hackathon Overview

In current multi-agent setups, when a pipeline closes or an agent is destroyed, immediate contextual learning vanishes. If Agent A figures out how to fix a database anomaly, Agent B will still fail on the same anomaly 5 minutes later. 

**Cognition Fabric** solves the problem of transient memory by unlocking the **Ratchet Effect**: a mathematical vector-based mechanism where an insight, optimization, or mitigation strategy discovered by one agent is securely propagated and retained by a distributed mesh. This ensures the network never has to solve the same problem twice.

## 🧠 Architectural Approach

We have designed a layered architecture that prioritizes speed, security, and true semantic understanding:

1. **Phase 1: Zero-Trust CSP Handshake**
   Before agents attempt to solve problems, they perform a simulated Constraint Satisfaction Protocol (CSP) handshake. They negotiate latency, encryption bounds, and processing buffers.
2. **Phase 2: Semantic Vector Engine (The Fast Path)**
   When an anomaly occurs (e.g., *"MySQL Connection Dropped"*), it is mathematically embedded into a 768-dimensional float array using the `nomic-embed-text` model. The system executes a **Cosine Similarity** search against the SQLite Fabric Ledger. If the mathematical meaning matches a previous problem by >85%, the system bypasses the LLM and instantly applies the cached solution in milliseconds.
3. **Phase 3: Deep Reasoning (The Slow Path)**
   If it is a completely novel problem, the system falls back to **LLaMA 3.2**. The LLM spends time reasoning through the IT issue and generating a breakthrough. 
4. **Phase 4: Autonomous Guardrails & Chaos Defense**
   Before a LLaMA breakthrough is pushed to the global Fabric, it must pass a strict security Guardrail. If the LLM hallucinates, generates malicious code (`rm -rf`), or returns a low confidence score, the update is blocked, preventing "Cognitive Poisoning".

## 🛠️ Implementation Details

- **Frontend:** React + TypeScript + Vite. Features a stunning, interactive HUD with an SVG Network Graph that physically models the mathematical vector clusters, real-time toast notifications, and interactive error-injection tools.
- **Backend:** Node.js + Express + Socket.io for real-time bidirectional streaming.
- **Database:** Standard SQLite transformed into a lightweight **Vector Database**. Instead of a heavy external service like Pinecone, we serialize 768-dimensional embeddings to SQLite and compute Cosine Similarity entirely in-memory using math algorithms.
- **AI Models:** Local LLM execution via Ollama to guarantee zero data-exfiltration and absolute privacy. 
  - `nomic-embed-text` (for instant semantic clustering)
  - `llama3.2` (for complex, novel problem solving)

## 🚀 How to Run Locally

### 1. Prerequisites (Ollama)
Because this system runs fully locally for maximum privacy, you must install **Ollama**.
1. Download Ollama from [ollama.com](https://ollama.com).
2. Open your terminal and pull the two required models:
   ```bash
   ollama pull nomic-embed-text
   ollama pull llama3.2
   ```

### 2. Install Dependencies
Open two terminal tabs in the root directory of this repository.

**Terminal 1 (Backend):**
```bash
cd backend
npm install
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm install
```

### 3. Start the Cognition Fabric
**Terminal 1 (Backend):**
```bash
# Starts the Node server and the SQLite Vector Engine on port 3001
npx tsx src/server.ts
```

**Terminal 2 (Frontend):**
```bash
# Starts the Vite React Dashboard on port 5173
npm run dev
```

### 4. Interactive Live Demo
Open `http://localhost:5173` in your browser. 
1. Click **Start Autonomous Simulation** to watch the agents generate insights and cluster them mathematically.
2. Type a custom IT error (e.g., *"Kubernetes pod is crash-looping"*) into the top bar and click **Inject Problem** to watch the Mesh instantly adapt.
3. Use the **Semantic Search** bar to manually query the Vector database and see the raw Cosine Similarity match percentage for yourself!
4. Click **Inject Poison** to demonstrate how the Autonomous Guardrails block a rogue agent from destroying the cluster.