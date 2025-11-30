'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface LeaderboardEntry {
  score: number;
  message: string;
  date: string;
}

const STAR_COUNT = 50;

export default function LeaderboardPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    setStars(newStars);

    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard');
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-16">
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

      <div className="relative z-10 min-h-screen flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Daily High Scores
            </h1>
            <p className="text-purple-200/60">
              Top scores and messages from each day
            </p>
            <p className="text-purple-300/40 text-sm mt-2">
              Updates daily at midnight
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
              <p className="text-purple-300">No high scores yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry, index) => (
                <div
                  key={index}
                  className="border-2 border-purple-400/30 rounded-lg p-6 bg-purple-400/5 backdrop-blur hover:border-cyan-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 text-transparent bg-clip-text">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-cyan-400 font-bold text-xl">
                          {entry.score} points
                        </div>
                        <div className="text-purple-300/60 text-sm">
                          {new Date(entry.date).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/40 rounded-lg p-4 border border-purple-400/20">
                    <p className="text-white/90 italic">"{entry.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/"
              className="text-purple-300/60 hover:text-purple-300 text-sm transition-colors"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
