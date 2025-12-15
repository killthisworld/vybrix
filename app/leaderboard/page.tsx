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

interface DailyEntry {
  score: number;
  message: string;
  date: string;
}

interface AllTimeEntry {
  token: string;
  highScore: number;
  message?: string;
  date: string;
}

const STAR_COUNT = 50;

export default function LeaderboardPage() {
  const [stars, setStars] = useState<Star[]>([]);
  const [dailyLeaderboard, setDailyLeaderboard] = useState<DailyEntry[]>([]);
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState<AllTimeEntry[]>([]);
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
      // Fetch daily leaderboard (day-by-day with messages)
      const dailyResponse = await fetch(`/api/leaderboard?month=${selectedMonth}&year=${selectedYear}`);
      const dailyData = await dailyResponse.json();
      setDailyLeaderboard(dailyData.leaderboard || []);

      // Fetch all-time top 5
      const allTimeResponse = await fetch(`/api/leaderboard/all-time`);
      const allTimeData = await allTimeResponse.json();
      // Only keep top 5
      setAllTimeLeaderboard((allTimeData.leaderboard || []).slice(0, 5));
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

  // Rank colors: 1=gold, 2=silver, 3=green, 4=blue, 5=purple
  const getRankColor = (index: number) => {
    switch(index) {
      case 0: return 'text-yellow-400'; // Gold
      case 1: return 'text-gray-300'; // Silver
      case 2: return 'text-green-400'; // Green
      case 3: return 'text-blue-400'; // Blue
      case 4: return 'text-purple-400'; // Purple
      default: return 'text-purple-400';
    }
  };

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
          ) : activeTab === 'daily' ? (
            /* DAILY TAB - Show day-by-day high scores with messages */
            dailyLeaderboard.length === 0 ? (
              <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
                <p className="text-purple-300">
                  No high scores for {months[selectedMonth - 1]} {selectedYear}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {dailyLeaderboard.map((entry, index) => (
                  <div
                    key={index}
                    className="border-2 border-purple-400/30 rounded-lg p-6 bg-purple-400/5 backdrop-blur hover:border-cyan-400/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
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
                    <div className="bg-black/40 rounded-lg p-4 border border-purple-400/20">
                      <p className="text-white/90 italic">"{entry.message}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ALL-TIME TAB - Show top 5, only #1 shows message */
            allTimeLeaderboard.length === 0 ? (
              <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
                <p className="text-purple-300">
                  No champions yet - be the first!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {allTimeLeaderboard.map((entry, index) => (
                  <div
                    key={entry.token}
                    className="border-2 border-purple-400/30 rounded-lg p-6 bg-purple-400/5 backdrop-blur hover:border-cyan-400/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${getRankColor(index)}`}>
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-cyan-400 font-bold text-2xl">
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
                    </div>
                    
                    {/* Only show message for #1 */}
                    {index === 0 && entry.message && (
                      <div className="bg-black/40 rounded-lg p-4 border border-yellow-400/30 mt-4">
                        <p className="text-yellow-100/90 italic">"{entry.message}"</p>
                        <p className="text-yellow-400/60 text-xs mt-2">👑 Champion's Message</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
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
