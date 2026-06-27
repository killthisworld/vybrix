'use client';

import { useState } from 'react';
import Link from 'next/link';

const projects = [
  { id: 1, name: 'Audio Tools Pipeline', progress: 68, color: 'from-cyan-500 to-teal-400' },
  { id: 2, name: 'Sci-Fi Novel Draft', progress: 35, color: 'from-cyan-600 to-purple-500' },
  { id: 3, name: 'Personal OS Architecture', progress: 55, color: 'from-cyan-500 to-blue-400' },
];

const captures = [
  { id: 1, ago: '2h ago', tag: 'Idea', tagColor: 'bg-[#1e2535] text-gray-300', text: 'Need to research rust-based VST wrappers.' },
  { id: 2, ago: '5h ago', tag: 'Observation', tagColor: 'bg-[#1e2535] text-gray-300', text: 'The pacing in chapter 4 is too slow, needs more dialogue.' },
  { id: 3, ago: '1d ago', tag: 'Decision', tagColor: 'bg-[#1e2535] text-gray-300', text: 'Switch from Postgres to SQLite for local first.' },
];

const PulseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>
);

const WaveIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M2 12s3-6 5-6 4 12 6 12 4-12 6-12 3 6 3 6"/>
  </svg>
);

const BrainIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.5 2A2.5 2.5 0 017 4.5v0A2.5 2.5 0 014.5 7v0A2.5 2.5 0 012 9.5v0A2.5 2.5 0 014.5 12v0A2.5 2.5 0 017 14.5v0A2.5 2.5 0 019.5 17v0A2.5 2.5 0 0112 14.5"/>
    <path d="M14.5 2A2.5 2.5 0 0117 4.5v0A2.5 2.5 0 0119.5 7v0A2.5 2.5 0 0122 9.5v0A2.5 2.5 0 0119.5 12v0A2.5 2.5 0 0117 14.5v0A2.5 2.5 0 0114.5 17v0A2.5 2.5 0 0112 14.5"/>
    <line x1="12" y1="14.5" x2="12" y2="22"/>
  </svg>
);

const SparkleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/>
    <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8z"/>
    <path d="M19 2l.5 1.5L21 4l-1.5.5L19 6l-.5-1.5L17 4l1.5-.5z"/>
  </svg>
);

export default function AyeKarpHome() {
  return (
    <div className="px-5 pt-14 pb-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
            <BrainIcon />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">AyeKarp!</h1>
        </div>
        <p className="text-sm text-white/40 ml-11">Cognitive stream active and organized.</p>
      </div>

      {/* Active Projects */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Active Projects</span>
          <PulseIcon />
        </div>
        <div className="space-y-3">
          {projects.map((p) => (
            <Link
              key={p.id}
              href={`/ayekarp/stream?project=${p.id}`}
              className="block bg-[#111520] border border-white/6 rounded-2xl px-5 py-4 hover:border-cyan-500/20 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-medium text-white/90">{p.name}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/25">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>
              <div className="h-1 bg-white/6 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${p.color}`}
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent Captures */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-widest text-white/40 uppercase">Recent Captures</span>
          <WaveIcon />
        </div>
        <div className="space-y-4">
          {captures.map((c, i) => (
            <div key={c.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-2 h-2 rounded-full bg-white/20 mt-1.5 shrink-0" />
                {i < captures.length - 1 && (
                  <div className="w-px flex-1 bg-white/8 mt-1" />
                )}
              </div>
              <div className="pb-4 flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs text-white/35">{c.ago}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${c.tagColor}`}>{c.tag}</span>
                </div>
                <p className="text-sm text-white/75 leading-relaxed">{c.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Synthesis Card */}
      <div className="bg-[#111520] border border-purple-500/20 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <SparkleIcon />
          <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">AI Synthesis</span>
        </div>
        <p className="text-sm text-white/60 leading-relaxed">
          A recurring theme around <span className="text-white/85">"system optimization"</span> has appeared across all 3 projects. Consider prioritizing the Rust integration to unblock both the Audio Pipeline and OS Architecture tracks.
        </p>
      </div>
    </div>
  );
}
