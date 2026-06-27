'use client';

import { useState } from 'react';

const reviews = [
  {
    id: 1,
    originalThought: '"I should quit social media entirely and focus on long-form writing."',
    emotion: 'Restless / Seeking Focus',
    context: 'Felt overwhelmed by fragmented information.',
    aiReflection: 'This idea surfaced 3 times this month during high-stress periods. It represents a desire for deeper cognitive engagement rather than just platform avoidance.',
  },
  {
    id: 2,
    originalThought: '"Rust is the right foundation — I need to stop second-guessing it."',
    emotion: 'Decisive / Confident',
    context: 'After reading about performance tradeoffs in C++.',
    aiReflection: 'This decision appears as a resolution to recurring Rust vs C++ debates across 5 captures. The pattern suggests this is settled — stop revisiting.',
  },
  {
    id: 3,
    originalThought: '"Chapter 4 needs a complete rewrite, not just edits."',
    emotion: 'Critical / Dissatisfied',
    context: 'Re-read the chapter after two weeks away.',
    aiReflection: 'Fresh-eye perspective triggered this. Similar realizations in months prior led to significant quality improvements. Trust the instinct.',
  },
];

const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
    <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5z"/>
    <path d="M5 15l.8 2.2L8 18l-2.2.8L5 21l-.8-2.2L2 18l2.2-.8z"/>
  </svg>
);

const ArchiveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const MergeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 009 9"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export default function ReviewPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [dragStartX, setDragStartX] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const remaining = reviews.filter(r => !dismissed.includes(r.id));
  const current = remaining[currentIndex % Math.max(remaining.length, 1)];

  const handleAction = (action: 'archive' | 'delete' | 'merge' | 'confirm') => {
    if (!current) return;
    setDismissed(prev => [...prev, current.id]);
    setDragOffset(0);
    // advance or wrap
    if (remaining.length <= 1) return;
    setCurrentIndex(prev => prev % (remaining.length - 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => setDragStartX(e.touches[0].clientX);
  const handleTouchMove = (e: React.TouchEvent) => {
    if (dragStartX === null) return;
    setDragOffset(e.touches[0].clientX - dragStartX);
  };
  const handleTouchEnd = () => {
    if (Math.abs(dragOffset) > 80) {
      handleAction(dragOffset > 0 ? 'confirm' : 'delete');
    }
    setDragStartX(null);
    setDragOffset(0);
  };

  const month = new Date().toLocaleString('default', { month: 'long' }).toUpperCase();

  if (!current) {
    return (
      <div className="px-5 pt-14 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="text-white/20 text-6xl mb-4">✓</div>
        <p className="text-white/50 text-center">All caught up.<br/>No more thoughts to review.</p>
      </div>
    );
  }

  return (
    <div className="px-5 pt-12 pb-4 flex flex-col min-h-[90vh]">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-semibold text-white">Monthly Review</h1>
        <p className="text-xs tracking-widest text-white/35 uppercase mt-0.5">{month} Reflection</p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-1.5 mb-6">
        {remaining.map((r, i) => (
          <div
            key={r.id}
            className={`rounded-full transition-all ${i === currentIndex % remaining.length ? 'w-4 h-1.5 bg-cyan-400' : 'w-1.5 h-1.5 bg-white/15'}`}
          />
        ))}
      </div>

      {/* Review Card */}
      <div
        className="bg-[#111520] border border-white/8 rounded-2xl p-6 flex-1 cursor-grab select-none transition-transform"
        style={{ transform: `translateX(${dragOffset}px) rotate(${dragOffset * 0.02}deg)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="mb-5">
          <p className="text-xs font-semibold tracking-widest text-white/35 uppercase mb-2">Original Thought</p>
          <p className="text-lg font-medium text-white/90 leading-snug">{current.originalThought}</p>
        </div>

        <div className="mb-5">
          <p className="text-xs font-semibold tracking-widest text-white/35 uppercase mb-1">Emotion / Context</p>
          <p className="text-sm text-white/65 leading-relaxed">
            {current.emotion} — {current.context}
          </p>
        </div>

        {/* AI Reflection */}
        <div className="bg-[#0e0f1e] border border-purple-500/25 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <SparkleIcon />
            <span className="text-xs font-semibold tracking-widest text-purple-400 uppercase">AI Reflection</span>
          </div>
          <p className="text-sm text-white/60 leading-relaxed">{current.aiReflection}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => handleAction('archive')}
          className="w-13 h-13 rounded-full bg-[#13161f] border border-white/10 flex items-center justify-center text-white/50 hover:text-white/80 transition-colors"
          style={{ width: 52, height: 52 }}
        >
          <ArchiveIcon />
        </button>
        <button
          onClick={() => handleAction('delete')}
          className="w-13 h-13 rounded-full bg-[#1a0f0f] border border-red-900/40 flex items-center justify-center text-red-400 hover:text-red-300 transition-colors"
          style={{ width: 52, height: 52 }}
        >
          <TrashIcon />
        </button>
        <button
          onClick={() => handleAction('merge')}
          className="w-13 h-13 rounded-full bg-[#0f1220] border border-blue-900/40 flex items-center justify-center text-blue-400 hover:text-blue-300 transition-colors"
          style={{ width: 52, height: 52 }}
        >
          <MergeIcon />
        </button>
        <button
          onClick={() => handleAction('confirm')}
          className="w-13 h-13 rounded-full bg-[#0a1f1a] border border-teal-900/40 flex items-center justify-center text-teal-400 hover:text-teal-300 transition-colors"
          style={{ width: 52, height: 52 }}
        >
          <CheckIcon />
        </button>
      </div>

      <p className="text-center text-xs text-white/20 tracking-widest uppercase mt-3">Swipe or use buttons</p>
    </div>
  );
}
