'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
  startX: number;
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
  
  // Get current month/year
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
      speed: Math.random() * 2 + 1,
      startX: Math.random() * 200 - 100,
    }));
    setStars(newStars);

    fetchLeaderboard();
  }, [selectedMonth, selectedYear]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?month=${selectedMonth}&year=${selectedYear}`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year options (current year and previous 2 years)
  const years = [selectedYear, selectedYear - 1, selectedYear - 2];

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-16">
      <style jsx>{`
        @keyframes moveStarsSlow {
          from { transform: translateX(0); }
          to { transform: translateX(-200vw); }
        }
        .moving-star-slow {
          animation: moveStarsSlow linear infinite;
        }
      `}</style>

      <div className="fixed inset-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white moving-star-slow"
            style={{
              left: `${star.startX}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.speed * 15}s`,
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
          </div>

          {/* Month/Year Filter */}
          <div className="mb-6 flex flex-col sm:flex-row gap-3 items-center justify-center">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="px-4 py-2 bg-purple-400/10 border-2 border-purple-400/30 text-purple-300 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {months.map((month, index) => (
                <option key={month} value={index + 1} className="bg-black">
                  {month}
                </option>
              ))}
            </select>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-4 py-2 bg-purple-400/10 border-2 border-purple-400/30 text-purple-300 rounded-lg focus:outline-none focus:border-cyan-400 transition-colors"
            >
              {years.map((year) => (
                <option key={year} value={year} className="bg-black">
                  {year}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
              <p className="text-purple-300">No high scores for {months[selectedMonth - 1]} {selectedYear}</p>
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
