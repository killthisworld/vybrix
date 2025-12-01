'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';

const STAR_COUNT = 50;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

export default function Home() {
  const [stars, setStars] = useState<Star[]>([]);
  const [token, setToken] = useState<string>('');
  const [canSend, setCanSend] = useState(true);
  const [timeUntilNext, setTimeUntilNext] = useState<string>('');

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 2 + 1,
    }));
    setStars(newStars);

    const savedToken = localStorage.getItem('vybrix_token');
    if (savedToken) {
      setToken(savedToken);
    }

    checkIfCanSend();
  }, []);

  useEffect(() => {
    if (!canSend) {
      const interval = setInterval(() => {
        updateTimer();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canSend]);

  const checkIfCanSend = async () => {
    const lastSentDate = localStorage.getItem('vybrix_last_sent_date');
    const today = new Date().toISOString().split('T')[0];

    if (lastSentDate === today) {
      setCanSend(false);
      updateTimer();
    } else {
      setCanSend(true);
    }
  };

  const updateTimer = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    setTimeUntilNext(`${hours}h ${minutes}m ${seconds}s`);

    if (diff <= 0) {
      localStorage.removeItem('vybrix_last_sent_date');
      setCanSend(true);
      setTimeUntilNext('');
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-16">
      <style jsx>{`
        @keyframes moveStarsSlow {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }
        .moving-star-slow {
          animation: moveStarsSlow linear infinite;
        }
      `}</style>

      {/* Slow moving stars background */}
      <div className="fixed inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white moving-star-slow"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.speed * 15}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            VYBRIX
          </h1>
          <p className="text-lg text-cyan-300/80">
            Connect through emotional frequency
          </p>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mb-8">
          {canSend ? (
            <Link
              href="/send"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-center"
            >
              Share Your Message
            </Link>
          ) : (
            <div className="px-8 py-3 bg-purple-400/10 border-2 border-purple-400/30 text-purple-300 font-semibold rounded-lg text-center cursor-not-allowed">
              <div>Next message in</div>
              <div className="text-cyan-400 text-sm mt-1">{timeUntilNext}</div>
            </div>
          )}

          {token ? (
            <Link
              href="/receive"
              className="px-8 py-3 border-2 border-purple-400 text-purple-300 font-semibold rounded-lg hover:bg-purple-400/10 transition-all text-center"
            >
              Check Your Response
            </Link>
          ) : (
            <p className="text-center text-purple-300/60 text-sm py-3">
              Send a message first to receive one
            </p>
          )}

          <Link
            href="/leaderboard"
            className="px-8 py-3 border-2 border-cyan-400 text-cyan-300 font-semibold rounded-lg hover:bg-cyan-400/10 transition-all text-center"
          >
            🏆 View Leaderboard
          </Link>
        </div>

        <div className="max-w-2xl">
          <div className="border border-purple-400/20 rounded-lg p-6 bg-purple-400/5 backdrop-blur">
            <h3 className="text-purple-300 font-semibold mb-3">How It Works</h3>
            <ul className="space-y-2 text-purple-200/70 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span>Send one message per day</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span>Your emotional frequency is analyzed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span>Matched with a resonant message (1-10 hours)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400">→</span>
                <span>Receive authentic connection</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
