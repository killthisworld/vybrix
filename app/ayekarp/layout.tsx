'use client';

import BottomNav from '@/app/components/ayekarp/BottomNav';

export default function AyeKarpLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0c12] text-white relative overflow-hidden">
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none">
        {Array.from({ length: 60 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${(i * 17.3) % 100}%`,
              top: `${(i * 13.7) % 100}%`,
              width: `${(i % 3) + 1}px`,
              height: `${(i % 3) + 1}px`,
              opacity: 0.08 + (i % 5) * 0.04,
            }}
          />
        ))}
      </div>

      <main className="relative z-10 pb-28 min-h-screen">
        {children}
      </main>

      <BottomNav />
    </div>
  );
}
