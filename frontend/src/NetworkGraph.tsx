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
    <div className="network-graph-container">
      <svg width="100%" height="100%" viewBox="0 0 600 400" preserveAspectRatio="xMidYMid meet">
        {/* Connection lines from orbiting nodes to the center */}
        {insights.map((_insight, i) => {
          const angle = (i / insights.length) * 2 * Math.PI;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          return (
            <line
              key={`line-${i}`}
              x1={centerX} y1={centerY} 
              x2={x} y2={y} 
              stroke="rgba(0, 81, 255, 0.35)"
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
              <circle cx={x} cy={y} r="12" fill="#ffffff" stroke="#0051ff" strokeWidth="3" />
              <circle cx={x} cy={y} r="4" fill="#0051ff" />
              <text x={x} y={y + 25} fill="#6b6b66" fontSize="10" textAnchor="middle" fontFamily="monospace">
                Node_{i + 1}
              </text>
            </g>
          );
        })}

        {/* Central Fabric Core */}
        <g className="fabric-core">
          <circle cx={centerX} cy={centerY} r="35" fill="rgba(0, 81, 255, 0.06)" stroke="#0051ff" strokeWidth="2" className="core-pulse" />
          <circle cx={centerX} cy={centerY} r="25" fill="rgba(0, 81, 255, 0.14)" stroke="#161616" strokeWidth="3" />
          <text x={centerX} y={centerY + 50} fill="#161616" fontSize="12" textAnchor="middle" fontWeight="bold">
            Cognition Fabric
          </text>
        </g>
      </svg>

      {/* Floating HUD Tooltip */}
      {hoveredNode && (
        <div className="node-tooltip">
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(22, 22, 22, 0.12)', paddingBottom: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ color: '#0051ff', fontWeight: 'bold' }}>{hoveredNode.problem_signature}</span>
            <span className="badge badge-info">{(hoveredNode.confidence_score * 100).toFixed(0)}%</span>
          </div>
          <p style={{ color: '#3d3d3a', margin: '0 0 0.5rem 0', fontSize: '0.9rem' }}>{hoveredNode.solution}</p>
          <div style={{ fontSize: '0.75rem', color: '#6b6b66' }}>
            Origin: <strong>{hoveredNode.source_agent_id}</strong>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {insights.length === 0 && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', pointerEvents: 'none', paddingBottom: '1.5rem' }}>
           <div style={{ padding: '0.75rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.85)', border: '1px solid var(--line)', borderRadius: '999px', backdropFilter: 'blur(6px)', boxShadow: 'var(--shadow-soft)' }}>
             <p style={{ margin: 0, fontWeight: 600 }}>The Fabric is currently empty <small style={{ fontWeight: 500 }}>· awaiting agent breakthroughs</small></p>
           </div>
        </div>
      )}
    </div>
  );
};
