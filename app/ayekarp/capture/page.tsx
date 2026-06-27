'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

const tags = ['Idea', 'Observation', 'Decision', 'Question', 'Feeling'];

const MicIcon = ({ active }: { active: boolean }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3" fill={active ? 'currentColor' : 'none'}/>
    <path d="M5 10a7 7 0 0014 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="9" y1="22" x2="15" y2="22"/>
  </svg>
);

export default function CapturePage() {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState('Idea');
  const [isRecording, setIsRecording] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  const handleSave = () => {
    if (!text.trim()) return;
    // TODO: persist to backend
    setSaved(true);
    setTimeout(() => router.push('/ayekarp'), 800);
  };

  const toggleRecording = () => setIsRecording(prev => !prev);

  return (
    <div className="px-5 pt-14 pb-4 flex flex-col min-h-[90vh]">
      <div className="text-center mb-8">
        <h1 className="text-xl font-semibold text-white">New Capture</h1>
        <p className="text-xs text-white/35 tracking-widest uppercase mt-0.5">Add to your cognitive stream</p>
      </div>

      {/* Tag selector */}
      <div className="flex gap-2 flex-wrap mb-5">
        {tags.map(tag => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              selectedTag === tag
                ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-300'
                : 'bg-[#13161f] border border-white/8 text-white/40 hover:text-white/60'
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Text input */}
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind..."
        className="flex-1 bg-[#111520] border border-white/8 rounded-2xl p-5 text-white/85 placeholder-white/20 text-sm leading-relaxed resize-none focus:outline-none focus:border-cyan-500/30 transition-colors min-h-[180px]"
      />

      {/* Mic button */}
      <div className="flex flex-col items-center my-6 gap-2">
        <button
          onClick={toggleRecording}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
            isRecording
              ? 'bg-red-500 text-white shadow-lg shadow-red-500/40 scale-105'
              : 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/25'
          }`}
        >
          <MicIcon active={isRecording} />
        </button>
        <span className="text-xs text-white/25">
          {isRecording ? 'Recording… tap to stop' : 'Tap to voice capture'}
        </span>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={!text.trim() || saved}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 text-white font-semibold text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {saved ? 'Saved ✓' : 'Add to Stream'}
      </button>
    </div>
  );
}
