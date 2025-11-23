'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STAR_COUNT = 50;

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

export default function Home() {
  const [stars, setStars] = useState<Star[]>([]);
  const [token, setToken] = useState<string>('');

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    setStars(newStars);

    const savedToken = localStorage.getItem('vybrix_token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
            VYBRIX
          </h1>
          <p className="text-lg text-cyan-300/80">
            Connect through emotional frequency
          </p>
        </div>

        <div className="max-w-2xl mb-12 text-center">
          <p className="text-purple-200/70 mb-4">
            Share your truth anonymously. Receive a message that resonates with your energy.
          </p>
          <p className="text-purple-200/60 text-sm">
            One message per day. No profiles. No borders. Pure connection.
          </p>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Link
            href="/send"
            className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-center"
          >
            Share Your Message
          </Link>

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
        </div>

        <div className="mt-16 max-w-2xl">
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
    </div>
  );
}
