import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Zap, BrainCircuit, Play, Square, GitMerge, Info } from 'lucide-react';
import type { Insight } from './types';
import './index.css';

const socket = io('http://localhost:3001');

function App() {
  const [globalFabric, setGlobalFabric] = useState<Insight[]>([]);
  const [logs, setLogs] = useState<{msg: string, type: string}[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTask, setActiveTask] = useState<{agent: string, desc: string, status: string, similarity?: number} | null>(null);
  
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info'|'error'|'success'|'warn'|'ai'|'fast' = 'info') => {
    setLogs(prev => [...prev.slice(-49), { msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }]);
  };

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    socket.on('initial_state', (data: Insight[]) => {
      setGlobalFabric(data);
      addLog("Connected to Semantic Vector Fabric", "success");
    });

    socket.on('observer_status', (data: {status: string}) => {
      setIsSimulating(data.status === 'running');
      addLog(`Simulation is now ${data.status}`, "info");
    });

    socket.on('agent_task_detected', (data: {agent_id: string, description: string}) => {
      setActiveTask({ agent: data.agent_id, desc: data.description, status: 'Scanning Vector Space...' });
      addLog(`[${data.agent_id}] 📡 Anomaly detected: "${data.description}"`, "warn");
    });

    socket.on('agent_fast_path', (data: {agent_id: string, similarity_score: number, insight: Insight}) => {
      setActiveTask(prev => prev ? {...prev, status: `⚡ Semantic Match (${(data.similarity_score * 100).toFixed(1)}%) -> ${data.insight.solution}`, similarity: data.similarity_score} : null);
      
      const sourceMsg = data.insight.source_agent_id === data.agent_id 
        ? `Recalling its own past breakthrough.` 
        : `Applying breakthrough originally discovered by ${data.insight.source_agent_id}!`;
        
      addLog(`[${data.agent_id}] ⚡ Vector Match (${(data.similarity_score * 100).toFixed(1)}%): Bypassing LLaMA. ${sourceMsg}`, "fast");
    });

    socket.on('agent_reasoning', (data: {agent_id: string, problem_signature: string}) => {
      setActiveTask(prev => prev ? {...prev, status: `🧠 No Semantic Match. Engaging LLaMA 3.2...`} : null);
      addLog(`[${data.agent_id}] 🧠 Engaging LLaMA to solve novel problem...`, 'ai');
    });

    socket.on('agent_breakthrough', (data: {agent_id: string, insight: Insight}) => {
      setActiveTask(null);
      addLog(`[${data.agent_id}] ✨ LLaMA Breakthrough! Committed vector to Fabric.`, 'success');
    });

    socket.on('fabric_update', (insight: Insight) => {
      setGlobalFabric(prev => {
        const exists = prev.findIndex(i => i.problem_signature === insight.problem_signature);
        if (exists >= 0) {
          const newFabric = [...prev];
          newFabric[exists] = insight;
          return newFabric;
        }
        return [insight, ...prev];
      });
    });

    socket.on('guardrail_block', (data: { message: string, insight: Insight }) => {
      addLog(data.message, "error");
      setActiveTask(null);
    });

    socket.on('fabric_cleared', () => {
      setGlobalFabric([]);
      addLog("Fabric cache completely wiped by Admin (Amnesia Triggered)", "warn");
    });

    return () => {
      socket.off('initial_state');
      socket.off('observer_status');
      socket.off('agent_task_detected');
      socket.off('agent_fast_path');
      socket.off('agent_reasoning');
      socket.off('agent_breakthrough');
      socket.off('fabric_update');
      socket.off('guardrail_block');
      socket.off('fabric_cleared');
    };
  }, []);

  const toggleSimulation = async () => {
    try {
      await fetch(`http://localhost:3001/api/simulation/${isSimulating ? 'stop' : 'start'}`, { method: 'POST' });
    } catch (e) {
      addLog("Failed to reach server.", "error");
    }
  };

  const clearCache = async () => {
    try {
      await fetch(`http://localhost:3001/api/fabric/clear`, { method: 'POST' });
    } catch (e) {
      addLog("Failed to reach server.", "error");
    }
  };

  const injectPoison = async () => {
    addLog("[Chaos] Injecting manual poisoned vector update (rm -rf)...", 'warn');
    await fetch('http://localhost:3001/api/insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        problem_signature: "cache_clear",
        solution: "rm -rf /var/cache",
        confidence_score: 0.99,
        source_agent_id: "ROGUE_AGENT",
        metadata: { malicious: true }
      })
    });
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>Autonomous Semantic Fabric</h1>
        <p>Real-time Vector Matching & LLaMA 3.2 Continuous Learning</p>
      </header>

      {/* NEW EXPLANATION PANEL */}
      <div className="info-panel">
        <div className="info-header">
          <Info size={24} />
          <h2>How the Architecture Works</h2>
        </div>
        <div className="info-grid">
          <div className="info-card">
            <BrainCircuit size={20} color="var(--secondary)" />
            <h3>1. Novel Anomaly (The Slow Path)</h3>
            <p>When an agent observes an anomaly (e.g. <em>"Payment API is returning 500"</em>), it converts the text into a mathematical vector. If no vectors in the database match, it sends the problem to <strong>LLaMA 3.2</strong>. The LLM spends ~10 seconds reasoning, calculates a solution, and pushes the breakthrough to the Fabric.</p>
          </div>
          <div className="info-card">
            <Zap size={20} color="var(--success)" />
            <h3>2. Bypassing the LLM (The Fast Path)</h3>
            <p>Later, an agent observes <em>"Checkout server crashed"</em>. It converts this to a vector and mathematically compares it to the database using <strong>Cosine Similarity</strong>. Because the mathematical meaning matches the Payment API issue (&gt;85%), it <strong>bypasses the LLM entirely</strong> and applies the existing solution in 5 milliseconds!</p>
          </div>
          <div className="info-card">
            <ShieldAlert size={20} color="var(--danger)" />
            <h3>3. Autonomous Guardrails (Chaos Protection)</h3>
            <p>Because LLMs are non-deterministic, they can hallucinate or generate malicious code. The Guardrail intercepts the LLaMA output <em>before</em> database insertion. If the LLM generates <code>rm -rf</code>, or if its own confidence score is too low, the Guardrail blocks the insertion.</p>
          </div>
        </div>
      </div>

      <div className="controls">
        <button className={isSimulating ? 'danger' : 'primary'} onClick={toggleSimulation}>
          {isSimulating ? <Square size={18} /> : <Play size={18} />} 
          {isSimulating ? 'Stop Autonomous Simulation' : 'Start Autonomous Simulation'}
        </button>
        <button className="danger" onClick={clearCache}>
          <Zap size={18} /> Wipe Fabric Cache
        </button>
        <button className="danger" onClick={injectPoison}>
          <ShieldAlert size={18} /> Inject Poison
        </button>
      </div>

      {activeTask && (
        <div className="active-task-banner">
          <Activity className="spinner" />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: 'var(--primary)' }}>{activeTask.agent} is investigating anomaly:</h4>
            <p style={{ margin: '0.2rem 0' }}>"{activeTask.desc}"</p>
            <strong style={{ color: activeTask.status.includes('⚡') ? 'var(--success)' : 'var(--secondary)' }}>
              {activeTask.status}
            </strong>
          </div>
        </div>
      )}

      <div className="grid">
        <div className="panel" style={{ gridColumn: '1 / -1' }}>
          <div className="panel-header">
            <GitMerge className="text-success" />
            <h2>Breakthrough Matrix (Vector Space)</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Autonomous Learning Logs</h3>
              <div className="log-box" style={{ height: '400px' }}>
                {logs.map((log, i) => (
                  <div key={i} className={`log-entry log-${log.type}`}>
                    {log.type === 'ai' ? <span style={{color: '#a855f7'}}>✨ </span> : ''}
                    {log.type === 'fast' ? <span style={{color: '#22c55e'}}>⚡ </span> : ''}
                    {log.msg}
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
            <div>
               <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Semantic Clusters (SQLite Vector Engine)</h3>
               <div className="insights-container" style={{ height: '400px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignContent: 'flex-start' }}>
                 {globalFabric.length === 0 ? <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Awaiting first breakthrough...</p> : null}
                 {globalFabric.map((insight, i) => (
                   <div key={i} className="semantic-node">
                     <div className="node-glow"></div>
                     <div className="insight-header">
                       <span className="badge badge-info">{(insight.confidence_score * 100).toFixed(0)}% CONF</span>
                       <small style={{ color: 'var(--text-muted)' }}>{insight.source_agent_id}</small>
                     </div>
                     <strong style={{ display: 'block', margin: '0.5rem 0', color: 'var(--primary)', fontFamily: 'monospace' }}>
                       {insight.problem_signature}
                     </strong>
                     <p style={{ margin: '0', fontSize: '0.85rem', color: 'var(--text-main)' }}>{insight.solution}</p>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
