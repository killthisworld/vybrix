'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
  size: number;
  color: string;
  borderColor: string;
  textColor: string;
  isCenter?: boolean;
}

const projectMaps: Record<string, { center: string; nodes: Node[] }> = {
  '1': {
    center: 'Audio Pipeline',
    nodes: [
      { id: 'center', label: 'Audio Pipeline', x: 50, y: 50, size: 80, color: '#0d2b2b', borderColor: '#22d3ee', textColor: '#ffffff', isCenter: true },
      { id: 'n1', label: 'UI Threading', x: 50, y: 18, size: 58, color: '#0d2420', borderColor: '#2dd4bf', textColor: '#5eead4' },
      { id: 'n2', label: 'Rust Core', x: 18, y: 52, size: 58, color: '#111a30', borderColor: '#3b4f8a', textColor: '#93c5fd' },
      { id: 'n3', label: 'VST3 Wrapper', x: 80, y: 48, size: 58, color: '#1a1030', borderColor: '#6d28d9', textColor: '#c084fc' },
      { id: 'n4', label: 'Latency Problem', x: 50, y: 76, size: 58, color: '#2a1020', borderColor: '#9f1239', textColor: '#fb7185' },
    ],
  },
  '2': {
    center: 'Novel Draft',
    nodes: [
      { id: 'center', label: 'Novel Draft', x: 50, y: 50, size: 80, color: '#1a0d2e', borderColor: '#a855f7', textColor: '#ffffff', isCenter: true },
      { id: 'n1', label: 'Chapter 4 Pacing', x: 50, y: 18, size: 58, color: '#1a1030', borderColor: '#7c3aed', textColor: '#c084fc' },
      { id: 'n2', label: 'World Building', x: 18, y: 52, size: 58, color: '#0d1a30', borderColor: '#2563eb', textColor: '#93c5fd' },
      { id: 'n3', label: 'Character Arc', x: 80, y: 48, size: 58, color: '#1a1a10', borderColor: '#ca8a04', textColor: '#fbbf24' },
      { id: 'n4', label: 'Plot Holes', x: 50, y: 76, size: 58, color: '#2a1010', borderColor: '#dc2626', textColor: '#f87171' },
    ],
  },
  '3': {
    center: 'Personal OS',
    nodes: [
      { id: 'center', label: 'Personal OS', x: 50, y: 50, size: 80, color: '#0d1a2e', borderColor: '#0ea5e9', textColor: '#ffffff', isCenter: true },
      { id: 'n1', label: 'File System', x: 50, y: 18, size: 58, color: '#0d2420', borderColor: '#059669', textColor: '#6ee7b7' },
      { id: 'n2', label: 'SQLite Local', x: 18, y: 52, size: 58, color: '#111a30', borderColor: '#2563eb', textColor: '#93c5fd' },
      { id: 'n3', label: 'Plugin API', x: 80, y: 48, size: 58, color: '#1a1030', borderColor: '#7c3aed', textColor: '#c084fc' },
      { id: 'n4', label: 'Auth Layer', x: 50, y: 76, size: 58, color: '#2a1010', borderColor: '#dc2626', textColor: '#f87171' },
    ],
  },
};

const StreamIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/><circle cx="12" cy="4" r="2"/><circle cx="20" cy="12" r="2"/>
    <circle cx="4" cy="12" r="2"/><circle cx="12" cy="20" r="2"/>
    <line x1="12" y1="6" x2="12" y2="9"/><line x1="18" y1="12" x2="15" y2="12"/>
    <line x1="6" y1="12" x2="9" y2="12"/><line x1="12" y1="18" x2="12" y2="15"/>
  </svg>
);

function StreamContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get('project') || '1';
  const map = projectMaps[projectId] || projectMaps['1'];
  const [activeNode, setActiveNode] = useState<string | null>(null);

  const centerNode = map.nodes.find(n => n.isCenter)!;
  const satelliteNodes = map.nodes.filter(n => !n.isCenter);

  return (
    <div className="px-5 pt-14 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <div className="flex items-center gap-2 bg-[#13161f] border border-white/10 rounded-full px-4 py-2">
          <StreamIcon />
          <span className="text-xs font-semibold tracking-widest text-white/70 uppercase">Stream Mapping</span>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
          {satelliteNodes.map((node) => {
            const cx = (centerNode.x / 100);
            const cy = (centerNode.y / 100);
            const nx = (node.x / 100);
            const ny = (node.y / 100);
            return (
              <line
                key={`line-${node.id}`}
                x1={`${centerNode.x}%`}
                y1={`${centerNode.y}%`}
                x2={`${node.x}%`}
                y2={`${node.y}%`}
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="1"
              />
            );
          })}
          {/* Outer ring around center */}
          <circle
            cx={`${centerNode.x}%`}
            cy={`${centerNode.y}%`}
            r="22%"
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth="1"
          />
        </svg>

        {/* Nodes */}
        {map.nodes.map((node) => (
          <button
            key={node.id}
            onClick={() => setActiveNode(activeNode === node.id ? null : node.id)}
            className="absolute flex items-center justify-center rounded-full border transition-all"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              width: `${node.size}px`,
              height: `${node.size}px`,
              transform: 'translate(-50%, -50%)',
              backgroundColor: node.color,
              borderColor: activeNode === node.id ? node.borderColor : `${node.borderColor}88`,
              borderWidth: node.isCenter ? '2px' : '1.5px',
              boxShadow: activeNode === node.id ? `0 0 20px ${node.borderColor}40` : 'none',
              zIndex: 2,
            }}
          >
            <span
              className="text-xs font-medium text-center leading-tight px-2"
              style={{ color: node.isCenter ? '#ffffff' : node.textColor }}
            >
              {node.label}
            </span>
          </button>
        ))}

        {/* Active node detail */}
        {activeNode && activeNode !== 'center' && (
          <div className="absolute bottom-4 left-0 right-0 mx-4 bg-[#111520] border border-white/10 rounded-2xl p-4" style={{ zIndex: 3 }}>
            <p className="text-sm text-white/50 mb-1">Connected concept</p>
            <p className="text-white font-medium">{map.nodes.find(n => n.id === activeNode)?.label}</p>
            <p className="text-xs text-white/35 mt-1">Tap again to dismiss · Long press to add a capture</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function StreamPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-white/30">Loading...</div>}>
      <StreamContent />
    </Suspense>
  );
}
