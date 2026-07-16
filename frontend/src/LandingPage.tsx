import {
  ArrowRight,
  BrainCircuit,
  CheckCircle2,
  Cpu,
  Database,
  Gauge,
  GitMerge,
  Layers,
  Network,
  Play,
  Radar,
  ShieldCheck,
  Sparkles,
  TerminalSquare,
  Workflow,
  XCircle,
  Zap,
} from 'lucide-react';

const launchDemo = () => {
  window.location.hash = '#/dashboard';
};

const steps = [
  {
    icon: <Radar size={22} />,
    title: 'Detect',
    text: 'Enterprise-style incidents stream in live — failing APIs, crashed servers, latency spikes.',
  },
  {
    icon: <BrainCircuit size={22} />,
    title: 'Reason',
    text: 'Nothing similar in memory? The agent engages LLaMA 3.2 locally and derives a fix. The slow path — ~10 s.',
  },
  {
    icon: <ShieldCheck size={22} />,
    title: 'Verify',
    text: 'An autonomous guardrail screens every insight for malicious commands, low confidence and policy violations.',
  },
  {
    icon: <Database size={22} />,
    title: 'Commit',
    text: 'Approved insights are embedded as vectors and written to the shared fabric — collective memory.',
  },
  {
    icon: <Zap size={22} />,
    title: 'Reuse',
    text: 'Any agent hitting a semantically similar problem skips the LLM and reuses the fix in ~5 ms. The fast path.',
  },
];

const stack = [
  {
    icon: <BrainCircuit size={20} />,
    name: 'LLaMA 3.2 · Ollama',
    role: 'Local reasoning engine for novel problems — no cloud dependency.',
  },
  {
    icon: <Database size={20} />,
    name: 'SQLite Vector Engine',
    role: 'Lightweight in-memory vector storage for fast cosine similarity clustering.',
  },
  {
    icon: <Gauge size={20} />,
    name: 'Cosine Similarity',
    role: 'Semantic matching — same problem, different words, still recognised.',
  },
  {
    icon: <ShieldCheck size={20} />,
    name: 'Autonomous Guardrail',
    role: 'Policy, security and confidence checks before anything enters memory.',
  },
  {
    icon: <Cpu size={20} />,
    name: 'Node.js + Express',
    role: 'Fabric API, accelerator and guardrail layer.',
  },
  {
    icon: <Network size={20} />,
    name: 'Socket.IO',
    role: 'Real-time mesh telemetry streamed to the dashboard.',
  },
  {
    icon: <Layers size={20} />,
    name: 'React + Vite + TS',
    role: 'The live dashboard you are about to see.',
  },
  {
    icon: <GitMerge size={20} />,
    name: 'CSP Handshake · Phase 1',
    role: 'Intent alignment between agents with opposing goals.',
  },
];

function LandingPage() {
  return (
    <div className="landing">
      {/* ── Nav ─────────────────────────────────────── */}
      <nav className="landing-nav">
        <div className="wordmark">
          <span className="wordmark-dot" />
          Cognition&nbsp;Fabric
        </div>
        <div className="landing-nav-links">
          <a href="#problem">Problem</a>
          <a href="#how">How it works</a>
          <a href="#stack">Stack</a>
        </div>
        <button className="primary nav-cta" onClick={launchDemo}>
          Launch demo <ArrowRight size={16} />
        </button>
      </nav>

      {/* ── Hero ────────────────────────────────────── */}
      <section className="landing-hero">
        <span className="eyebrow">Code with Cisco · Platinum Flag · Team resQ</span>
        <h1 className="hero-title">
          AI agents forget.
          <br />
          Ours <span className="accent">remember — together.</span>
        </h1>
        <p className="hero-sub">
          When an AI agent solves a hard problem today, that learning dies with the session.
          The Cognition Fabric is a shared, guardrailed memory where one agent's breakthrough
          instantly becomes every agent's instinct.
        </p>
        <div className="hero-ctas">
          <button className="primary" onClick={launchDemo}>
            <Play size={17} /> Launch live demo
          </button>
          <a className="ghost-btn" href="#how">
            See how it works
          </a>
        </div>

        <div className="hero-stats">
          <div className="stat">
            <span className="stat-num">~5 ms</span>
            <span className="stat-label">to reuse a known fix</span>
          </div>
          <div className="stat">
            <span className="stat-num">~10 s</span>
            <span className="stat-label">first-time LLM reasoning</span>
          </div>
          <div className="stat">
            <span className="stat-num">3</span>
            <span className="stat-label">autonomous agents, one mesh</span>
          </div>
          <div className="stat">
            <span className="stat-num">0</span>
            <span className="stat-label">poisoned updates reach memory</span>
          </div>
        </div>
      </section>

      {/* ── 01 · Problem ────────────────────────────── */}
      <section className="landing-section" id="problem">
        <span className="section-label">01 — The problem</span>
        <h2 className="section-title">Multi-agent AI has amnesia</h2>
        <p className="section-sub">
          Every time a session closes, contextual learning vanishes. Fleets of agents burn
          compute re-solving the same edge cases — and a breakthrough in one agent never
          reaches its neighbours.
        </p>

        <div className="compare-grid">
          <div className="compare-card bad">
            <div className="compare-head">
              <XCircle size={20} />
              <h3>Without a fabric</h3>
            </div>
            <p>
              Agent A solves a payment outage. The session ends, the memory is wiped. Tomorrow
              Agent B hits the <em>same</em> outage and starts from zero — same cost, same
              latency, every single time.
            </p>
            <div className="compare-flow">solve → forget → re-solve → forget…</div>
          </div>
          <div className="compare-card good">
            <div className="compare-head">
              <CheckCircle2 size={20} />
              <h3>With the Cognition Fabric</h3>
            </div>
            <p>
              Agent A's verified fix is committed to shared vector memory. Agent B recognises
              the same problem <em>semantically</em> — even worded differently — and applies
              the fix in milliseconds.
            </p>
            <div className="compare-flow accent">solve once → verify → reuse forever</div>
          </div>
        </div>
        <p className="ratchet-note">
          <Sparkles size={16} /> Knowledge only moves forward. That's the <strong>ratchet
          effect</strong> — and it's what this prototype proves end-to-end.
        </p>
      </section>

      {/* ── 02 · How it works ───────────────────────── */}
      <section className="landing-section" id="how">
        <span className="section-label">02 — How we solve it</span>
        <h2 className="section-title">Five steps, one ratchet</h2>
        <p className="section-sub">
          Every incident flows through the same guardrailed pipeline. The first encounter is
          expensive; every one after that is nearly free.
        </p>

        <div className="steps-grid">
          {steps.map((step, i) => (
            <div className="step-card" key={step.title}>
              <span className="step-num">0{i + 1}</span>
              <div className="step-icon">{step.icon}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 03 · Chaos ──────────────────────────────── */}
      <section className="landing-section" id="chaos">
        <div className="chaos-band">
          <div className="chaos-copy">
            <span className="section-label light">03 — Chaos injector</span>
            <h2>Break it. We planned for that.</h2>
            <p>
              Inject a poisoned update (<code>rm -rf /var/cache</code>) or type your own
              incident straight from the dashboard. Watch the guardrail intercept it live —
              the rogue insight is blocked, isolated and logged, and the fabric's integrity
              never resets to zero.
            </p>
          </div>
          <button className="chaos-cta" onClick={launchDemo}>
            <TerminalSquare size={17} /> Try the chaos injector
          </button>
        </div>
      </section>

      {/* ── 04 · Stack ──────────────────────────────── */}
      <section className="landing-section" id="stack">
        <span className="section-label">04 — What it's built with</span>
        <h2 className="section-title">Small stack, sharp edges</h2>
        <p className="section-sub">
          Everything runs locally — a compact, defensible prototype rather than a sketch of
          many features.
        </p>

        <div className="stack-grid">
          {stack.map((item) => (
            <div className="stack-card" key={item.name}>
              <div className="stack-icon">{item.icon}</div>
              <div>
                <h3>{item.name}</h3>
                <p>{item.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────── */}
      <footer className="landing-footer">
        <div className="wordmark small">
          <span className="wordmark-dot" />
          Team resQ
        </div>
        <span>
          <Workflow size={14} /> Internet of Cognition — Phase 2 · The Continuous Mesh &amp;
          The Ratchet Effect
        </span>
        <a href="#/dashboard" onClick={launchDemo}>
          Launch demo <ArrowRight size={14} />
        </a>
      </footer>
    </div>
  );
}

export default LandingPage;
