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
  token: string;
  highScore: number;
  date: string;
}

const STAR_COUNT = 50;

export default function LeaderboardPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'alltime'>('daily');
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
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
  }, []);

  useEffect(() => {
    fetchLeaderboards();
  }, [selectedMonth, selectedYear]);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      // Fetch daily leaderboard
      const dailyResponse = await fetch(`/api/leaderboard?month=${selectedMonth}&year=${selectedYear}`);
      const dailyData = await dailyResponse.json();
      setDailyLeaderboard(dailyData.leaderboard || []);

      // Fetch all-time leaderboard
      const allTimeResponse = await fetch(`/api/leaderboard/all-time`);
      const allTimeData = await allTimeResponse.json();
      setAllTimeLeaderboard(allTimeData.leaderboard || []);
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

  const years = [selectedYear, selectedYear - 1, selectedYear - 2];

  const currentLeaderboard = activeTab === 'daily' ? dailyLeaderboard : allTimeLeaderboard;

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
              🏆 Leaderboard
            </h1>
            <p className="text-purple-200/60">
              Top cosmic warriors across the galaxy
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="mb-6 flex gap-3 items-center justify-center">
            <button
              onClick={() => setActiveTab('daily')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'daily'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-purple-400/10 border-2 border-purple-400/30 text-purple-300 hover:border-cyan-400/50'
              }`}
            >
              Daily High Scores
            </button>
            <button
              onClick={() => setActiveTab('alltime')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'alltime'
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                  : 'bg-purple-400/10 border-2 border-purple-400/30 text-purple-300 hover:border-cyan-400/50'
              }`}
            >
              All-Time Champions
            </button>
          </div>

          {/* Month/Year Filter - Only show for daily tab */}
          {activeTab === 'daily' && (
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
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
          ) : currentLeaderboard.length === 0 ? (
            <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
              <p className="text-purple-300">
                {activeTab === 'daily' 
                  ? `No high scores for ${months[selectedMonth - 1]} ${selectedYear}`
                  : 'No champions yet - be the first!'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentLeaderboard.map((entry, index) => (
                <div
                  key={entry.token}
                  className="border-2 border-purple-400/30 rounded-lg p-6 bg-purple-400/5 backdrop-blur hover:border-cyan-400/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`text-3xl font-bold ${
                        index === 0 ? 'text-yellow-400' :
                        index === 1 ? 'text-gray-300' :
                        index === 2 ? 'text-orange-600' :
                        'text-purple-400'
                      }`}>
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-cyan-400 font-bold text-xl">
                          {entry.highScore} points
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
                    <div className="text-purple-300/40 text-xs font-mono">
                      {entry.token.slice(0, 8)}...
                    </div>
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
