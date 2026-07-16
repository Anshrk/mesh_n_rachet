import { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { Activity, ShieldAlert, Zap, BrainCircuit, Play, Square, GitMerge, Info } from 'lucide-react';
import { NetworkGraph } from './NetworkGraph';
import type { Insight } from './types';
import './index.css';

const socket = io('http://localhost:3001');

function App() {
  const [globalFabric, setGlobalFabric] = useState<Insight[]>([]);
  const [logs, setLogs] = useState<{id: string, msg: string, type: string}[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTask, setActiveTask] = useState<{agent: string, desc: string, status: string, similarity?: number} | null>(null);
  
  // CSP State
  const [cspActive, setCspActive] = useState<{a1: string, a2: string} | null>(null);
  const [cspLogs, setCspLogs] = useState<string[]>([]);
  
  const cspLogEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: 'info'|'error'|'success'|'warn'|'ai'|'fast'|'csp'|'agentA'|'agentB'|'agentC' = 'info') => {
    const id = Math.random().toString(36).substring(7);
    setLogs(prev => [...prev.slice(-30), { id, msg: `[${new Date().toLocaleTimeString()}] ${msg}`, type }]);
  };

  useEffect(() => {
    socket.on('initial_state', (data: Insight[]) => {
      setGlobalFabric(data);
      addLog("Connected to Semantic Vector Fabric", "success");
    });

    socket.on('observer_status', (data: {status: string}) => {
      setIsSimulating(data.status === 'running');
      addLog(`Simulation is now ${data.status}`, "info");
      if (data.status === 'stopped') setCspActive(null);
    });

    socket.on('csp_started', (data: {a1: string, a2: string}) => {
      setCspActive(data);
      setCspLogs([]);
      addLog(`[CSP] Intent Handshake started between ${data.a1} and ${data.a2}`, "csp");
    });

    socket.on('csp_update', (data: {message: string}) => {
      setCspLogs(prev => [...prev, data.message]);
    });

    socket.on('csp_resolved', (data: any) => {
      setCspLogs(prev => [...prev, `[CSP] Contract Signed: Session ${data.session_id}`]);
      // The CSP Banner will now remain on screen to display the Latest Phase 1 Handshake
    });

    socket.on('agent_task_detected', (data: {agent_id: string, description: string}) => {
      setActiveTask({ agent: data.agent_id, desc: data.description, status: 'Scanning Vector Space...' });
      
      let type: any = 'warn';
      if (data.agent_id.includes('Alpha')) type = 'agentA';
      if (data.agent_id.includes('Beta')) type = 'agentB';
      if (data.agent_id.includes('Charlie')) type = 'agentC';
      
      addLog(`[${data.agent_id}] 📡 Anomaly detected: "${data.description}"`, type);
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
      socket.off('csp_started');
      socket.off('csp_update');
      socket.off('csp_resolved');
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

  const [customError, setCustomError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResult, setSearchResult] = useState<{match: Insight|null, similarity: number} | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setSearchResult(null);
    try {
      const res = await fetch('http://localhost:3001/api/fabric/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      addLog("Failed to reach search API.", "error");
    }
    setIsSearching(false);
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

  const handleInjectCustom = async () => {
    if (!customError.trim()) return;
    try {
      await fetch(`http://localhost:3001/api/simulation/inject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: customError })
      });
      addLog(`Audience Injection: "${customError}"`, 'warn');
      setCustomError('');
    } catch (e) {
      addLog("Failed to reach server.", "error");
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <span className="eyebrow">Internet of Cognition — Phase 2</span>
        <h1>Autonomous <span className="accent">Semantic Fabric</span></h1>
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

      <div className="controls" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <button className={isSimulating ? 'danger' : 'primary'} onClick={toggleSimulation}>
          {isSimulating ? <Square size={18} /> : <Play size={18} />} 
          {isSimulating ? 'Pause Autonomous Simulation' : 'Start Autonomous Simulation'}
        </button>
        <button className="danger" onClick={clearCache}>
          <Zap size={18} /> Wipe Fabric Cache
        </button>
        <button className="danger" onClick={injectPoison}>
          <ShieldAlert size={18} /> Inject Poison
        </button>

        {/* Custom Injection UI */}
        <div className="custom-inject-container">
          <input 
            type="text" 
            placeholder="Type a custom IT error..." 
            value={customError}
            onChange={(e) => setCustomError(e.target.value)}
            className="glass-input"
            onKeyDown={(e) => e.key === 'Enter' && handleInjectCustom()}
          />
          <button className="primary" onClick={handleInjectCustom}>
            Inject Problem
          </button>
        </div>
        
        {/* Manual Semantic Search UI */}
        <div className="custom-inject-container">
          <input 
            type="text" 
            placeholder="Search Fabric Memory..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button className="primary" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? 'Searching...' : 'Semantic Search'}
          </button>
        </div>
      </div>

      {searchResult && searchResult.match && (
        <div className="search-result-banner" style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid #38bdf8', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <BrainCircuit size={24} color="#38bdf8" />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0284c7' }}>
              Vector Match Found ({ (searchResult.similarity * 100).toFixed(1) }% Similarity)
            </h4>
            <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-main)' }}><strong>Signature:</strong> {searchResult.match.problem_signature}</p>
            <p style={{ margin: 0, color: 'var(--text-main)' }}><strong>Solution:</strong> {searchResult.match.solution}</p>
          </div>
          <button className="danger" onClick={() => setSearchResult(null)} style={{ padding: '0.2rem 0.5rem' }}>✕</button>
        </div>
      )}
      
      {searchResult && !searchResult.match && (
        <div className="search-result-banner" style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid #f43f5e', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ShieldAlert size={24} color="#f43f5e" />
          <div style={{ flex: 1 }}>
            <h4 style={{ margin: 0, color: '#be123c' }}>No semantic matches found in Fabric Memory.</h4>
          </div>
          <button className="danger" onClick={() => setSearchResult(null)} style={{ padding: '0.2rem 0.5rem' }}>✕</button>
        </div>
      )}

      {cspActive && (
        <div className="csp-banner">
          <div className="csp-header">
            <Activity className="spinner" />
            <h3 style={{ margin: 0 }}>Latest Phase 1 CSP Handshake: {cspActive.a1} ⚡ {cspActive.a2}</h3>
          </div>
          <div className="csp-logs" style={{ maxHeight: '120px', overflowY: 'auto' }}>
            {cspLogs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            <div ref={cspLogEndRef} />
          </div>
        </div>
      )}

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
          <div className="panel-split">
            <div style={{ position: 'relative', height: '400px', overflowY: 'auto', paddingRight: '10px' }}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem', position: 'sticky', top: 0, background: 'rgba(15, 23, 42, 0.95)', zIndex: 5, padding: '0.5rem 0' }}>Autonomous Learning Logs</h3>
              
              {/* Toast Notification Container */}
              <div className="toast-container">
                {logs.map((log) => (
                  <div key={log.id} className={`toast toast-${log.type}`}>
                    {log.type === 'ai' ? <span style={{color: '#c9a4ff'}}>✨ </span> : ''}
                    {log.type === 'fast' ? <span style={{color: '#5fd99a'}}>⚡ </span> : ''}
                    {log.msg}
                  </div>
                ))}
              </div>

            </div>
            <div>
               <h3 style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Semantic Clusters (Cognition Fabric Vector Engine)</h3>
               <NetworkGraph insights={globalFabric} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
