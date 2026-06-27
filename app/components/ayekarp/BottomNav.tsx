'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const HomeIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/>
    <path d="M9 21V12h6v9"/>
  </svg>
);

const StreamIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <circle cx="12" cy="4" r="2"/>
    <circle cx="20" cy="12" r="2"/>
    <circle cx="4" cy="12" r="2"/>
    <circle cx="12" cy="20" r="2"/>
    <line x1="12" y1="6" x2="12" y2="9"/>
    <line x1="18" y1="12" x2="15" y2="12"/>
    <line x1="6" y1="12" x2="9" y2="12"/>
    <line x1="12" y1="18" x2="12" y2="15"/>
  </svg>
);

const MicIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="2" width="6" height="12" rx="3"/>
    <path d="M5 10a7 7 0 0014 0"/>
    <line x1="12" y1="19" x2="12" y2="22"/>
    <line x1="9" y1="22" x2="15" y2="22"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

export default function BottomNav() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 bg-[#13161f]/90 backdrop-blur-md border border-white/8 rounded-full px-4 py-3 shadow-2xl">
        <Link
          href="/ayekarp"
          className={`p-2.5 rounded-full transition-colors ${
            isActive('/ayekarp') ? 'text-white' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <HomeIcon />
        </Link>

        <Link
          href="/ayekarp/stream"
          className={`p-2.5 rounded-full transition-colors ${
            isActive('/ayekarp/stream') ? 'text-cyan-400' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <StreamIcon />
        </Link>

        {/* Capture CTA */}
        <Link
          href="/ayekarp/capture"
          className="p-3.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-white shadow-lg shadow-cyan-500/40 transition-all mx-1"
        >
          <MicIcon />
        </Link>

        <Link
          href="/ayekarp/review"
          className={`p-2.5 rounded-full transition-colors ${
            isActive('/ayekarp/review') ? 'text-cyan-400' : 'text-white/40 hover:text-white/70'
          }`}
        >
          <CalendarIcon />
        </Link>
      </div>
    </div>
  );
}
