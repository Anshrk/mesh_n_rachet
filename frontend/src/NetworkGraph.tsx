import React, { useState } from 'react';
import type { Insight } from './types';

interface NetworkGraphProps {
  insights: Insight[];
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({ insights }) => {
  const [hoveredNode, setHoveredNode] = useState<Insight | null>(null);

  const centerX = 300;
  const centerY = 200;
  const radius = 120;

  return (
    <div className="network-graph-container" style={{ position: 'relative', width: '100%', height: '400px', background: 'rgba(0,0,0,0.5)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        {/* Connection lines from orbiting nodes to the center */}
        {insights.map((insight, i) => {
          const angle = (i / insights.length) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line 
              key={`line-${i}`}
              x1={centerX} y1={centerY} 
              x2={x} y2={y} 
              stroke="rgba(168, 85, 247, 0.4)" 
              strokeWidth="2" 
              className="pulse-line"
            />
          );
        })}

        {/* Orbiting Insight Nodes */}
        {insights.map((insight, i) => {
          const angle = (i / insights.length) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <g 
              key={`node-${i}`} 
              className="insight-node"
              onMouseEnter={() => setHoveredNode(insight)}
              onMouseLeave={() => setHoveredNode(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={x} cy={y} r="12" fill="rgba(15, 23, 42, 1)" stroke="#38bdf8" strokeWidth="3" />
              <circle cx={x} cy={y} r="4" fill="#38bdf8" />
              <text x={x} y={y + 25} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Node_{i + 1}
              </text>
            </g>
          );
        })}

        {/* Central Fabric Core */}
        <g className="fabric-core">
          <circle cx={centerX} cy={centerY} r="35" fill="rgba(168, 85, 247, 0.1)" stroke="#a855f7" strokeWidth="2" className="core-pulse" />
          <circle cx={centerX} cy={centerY} r="25" fill="rgba(168, 85, 247, 0.2)" stroke="#a855f7" strokeWidth="3" />
          <text x={centerX} y={centerY + 50} fill="#c084fc" fontSize="12" textAnchor="middle" fontWeight="bold">
            Cognition Fabric
          </text>
        </g>
      </svg>

      {/* Floating HUD Tooltip */}
      {hoveredNode && (
        <div className="node-tooltip">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(56, 189, 248, 0.3)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{hoveredNode.problem_signature}</span>
            <span className="badge badge-info">{(hoveredNode.confidence_score * 100).toFixed(0)}%</span>
          </div>
          <p style={{ color: '#e2e8f0', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{hoveredNode.solution}</p>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Origin: <strong>{hoveredNode.source_agent_id}</strong>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {insights.length === 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
           <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
             <p style={{ margin: 0 }}>The Fabric is currently empty.</p>
             <small>(Awaiting Agent Breakthroughs)</small>
           </div>
        </div>
      )}
    </div>
  );
};
