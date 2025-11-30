'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const STAR_COUNT = 100;

interface ReceiveResponse {
  status: string;
  message: string;
  minutesLeft?: number;
}

export default function ReceivePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<string>('');
  const [receivedMessage, setReceivedMessage] = useState<string>('');
  const [stars, setStars] = useState<Star[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [nextRefresh, setNextRefresh] = useState<number>(5);

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 3 + 1,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    fetchMessage();
  }, []);

  useEffect(() => {
    if (status === 'waiting' || status === 'pending') {
      const timer = setTimeout(() => {
        setRefreshing(true);
        fetchMessage();
      }, nextRefresh * 1000);

      return () => clearTimeout(timer);
    }
  }, [status, nextRefresh]);

  useEffect(() => {
    if (nextRefresh > 0 && (status === 'waiting' || status === 'pending')) {
      const timer = setInterval(() => {
        setNextRefresh(prev => (prev > 1 ? prev - 1 : prev));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [status]);

  const fetchMessage = async () => {
    try {
      const token = localStorage.getItem('vybrix_token');

      if (!token) {
        setError('No session found. Please send a message first.');
        setLoading(false);
        return;
      }

      const response = await fetch(`/api/receive?token=${token}`);
      const data: ReceiveResponse = await response.json();

      if (!response.ok) {
        setError(data.message || 'Error fetching message');
        setLoading(false);
        return;
      }

      setStatus(data.status);

      if (data.status === 'received') {
        setReceivedMessage(data.message);
      }

      setLoading(false);
      setRefreshing(false);
      setNextRefresh(5);
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
      setRefreshing(false);
      console.error(err);
    }
  };

  const handleReport = () => {
    const reason = prompt("Please describe why you're reporting this message:");
    if (reason && reason.trim()) {
      const token = localStorage.getItem('vybrix_token');
      const subject = encodeURIComponent('Inappropriate Message Report');
      const body = encodeURIComponent(
        `Reason: ${reason}\n\nToken: ${token}\n\nMessage: "${receivedMessage}"`
      );
      window.location.href = `mailto:vybrix.help@gmail.com?subject=${subject}&body=${body}`;
    }
  };

  if (loading) {
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

        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="mb-6">
              <div className="inline-block">
                <div className="w-16 h-16 border-4 border-purple-400/20 border-t-cyan-400 rounded-full animate-spin" />
              </div>
            </div>
            <p className="text-purple-300 text-lg">Tuning into your frequency...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden pb-16">
      <style jsx>{`
        @keyframes moveStars {
          from {
            transform: translateX(100vw);
          }
          to {
            transform: translateX(-100vw);
          }
        }
        
        @keyframes flyUFO {
          0% {
            transform: translateX(0) translateY(0);
          }
          25% {
            transform: translateX(0) translateY(-8px);
          }
          50% {
            transform: translateX(0) translateY(0);
          }
          75% {
            transform: translateX(0) translateY(8px);
          }
          100% {
            transform: translateX(0) translateY(0);
          }
        }
        
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes glow {
          0%, 100% {
            filter: drop-shadow(0 0 15px rgba(100, 116, 139, 0.6));
          }
          50% {
            filter: drop-shadow(0 0 25px rgba(148, 163, 184, 0.8));
          }
        }
        
        .moving-star {
          animation: moveStars linear infinite;
        }
        
        .ufo-container {
          animation: flyUFO 3s ease-in-out infinite, glow 2s ease-in-out infinite;
        }
        
        .loading-dot {
          animation: dotPulse 1.4s ease-in-out infinite;
        }
      `}</style>

      {status === 'waiting' && (
        <>
          {/* Moving stars background - full screen */}
          <div className="fixed inset-0 overflow-hidden">
            {stars.map((star, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-white moving-star"
                style={{
                  left: `${star.x}%`,
                  top: `${star.y}%`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                  opacity: star.opacity,
                  animationDuration: `${star.speed * 10}s`,
                }}
              />
            ))}
          </div>

          {/* UFO in center of screen */}
          <div className="fixed inset-0 flex items-center justify-center z-20">
            <div className="ufo-container">
              <svg width="240" height="120" viewBox="0 0 240 120" className="drop-shadow-2xl">
                {/* Main saucer body - realistic metallic look */}
                <defs>
                  <radialGradient id="metalGradient" cx="50%" cy="40%">
                    <stop offset="0%" stopColor="#e2e8f0" />
                    <stop offset="40%" stopColor="#94a3b8" />
                    <stop offset="70%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#475569" />
                  </radialGradient>
                  
                  <radialGradient id="domeGradient" cx="50%" cy="30%">
                    <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#0369a1" stopOpacity="0.9" />
                  </radialGradient>
                  
                  <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#cbd5e1" />
                    <stop offset="50%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>

                  <filter id="metalShine">
                    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
                    <feOffset dx="0" dy="1" result="offsetblur"/>
                    <feComponentTransfer>
                      <feFuncA type="linear" slope="0.3"/>
                    </feComponentTransfer>
                    <feMerge>
                      <feMergeNode/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Bottom shadow/rim */}
                <ellipse cx="120" cy="65" rx="85" ry="10" fill="#1e293b" opacity="0.4" />
                
                {/* Main saucer disc */}
                <ellipse cx="120" cy="60" rx="90" ry="22" fill="url(#metalGradient)" filter="url(#metalShine)" />
                
                {/* Metallic rim detail */}
                <ellipse cx="120" cy="58" rx="90" ry="20" fill="none" stroke="url(#edgeGradient)" strokeWidth="2" opacity="0.6" />
                
                {/* Center band */}
                <ellipse cx="120" cy="60" rx="88" ry="8" fill="#475569" opacity="0.5" />
                
                {/* Top dome (cockpit) */}
                <ellipse cx="120" cy="45" rx="35" ry="22" fill="url(#domeGradient)" />
                
                {/* Dome highlight */}
                <ellipse cx="120" cy="42" rx="25" ry="15" fill="#f0f9ff" opacity="0.3" />
                
                {/* Small port windows */}
                <ellipse cx="80" cy="58" rx="5" ry="3" fill="#fbbf24" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.5s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="100" cy="60" rx="5" ry="3" fill="#22d3ee" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.2s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="140" cy="60" rx="5" ry="3" fill="#22d3ee" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.3s" repeatCount="indefinite" />
                </ellipse>
                <ellipse cx="160" cy="58" rx="5" ry="3" fill="#fbbf24" opacity="0.9">
                  <animate attributeName="opacity" values="0.6;1;0.6" dur="1.4s" repeatCount="indefinite" />
                </ellipse>
                
                {/* Panel lines for detail */}
                <path d="M 120 38 Q 100 55, 120 62" stroke="#334155" strokeWidth="1" fill="none" opacity="0.3" />
                <path d="M 120 38 Q 140 55, 120 62" stroke="#334155" strokeWidth="1" fill="none" opacity="0.3" />
              </svg>
            </div>
          </div>

          {/* Finding your match text - moved down */}
          <div className="fixed top-32 left-0 right-0 flex items-center justify-center z-30">
            <div className="flex items-center space-x-3">
              <span className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                Finding your match
              </span>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-purple-400 rounded-full loading-dot" />
                <div className="w-2 h-2 bg-cyan-400 rounded-full loading-dot" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 bg-pink-400 rounded-full loading-dot" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>

          {/* Auto refresh info at bottom */}
          <div className="fixed bottom-24 left-0 right-0 text-center z-30">
            <p className="text-purple-300/40 text-sm">
              Auto-refreshing in {nextRefresh}s {refreshing ? '(checking now...)' : ''}
            </p>
          </div>

          {/* Back to home button */}
          <div className="fixed bottom-8 left-0 right-0 text-center z-30">
            <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </>
      )}

      {status !== 'waiting' && (
        <>
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

          <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
            <div className="w-full max-w-2xl">
              <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
                  Your Resonance
                </h1>
              </div>

              {error && (
                <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded text-red-300 mb-6">
                  {error}
                </div>
              )}

              {status === 'no_message_sent' && (
                <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
                  <h2 className="text-xl font-semibold text-purple-300 mb-4">
                    Share Your Message First
                  </h2>
                  <p className="text-purple-200/60 mb-6">
                    Send a message to receive one that resonates with your energy.
                  </p>
                  <Link
                    href="/send"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Send a Message
                  </Link>
                </div>
              )}

              {status === 'pending' && (
                <div className="border-2 border-cyan-400/50 rounded-lg p-8 bg-cyan-400/5 backdrop-blur text-center">
                  <div className="mb-6">
                    <div className="inline-block">
                      <div className="w-12 h-12 border-3 border-cyan-400/20 border-t-cyan-300 rounded-full animate-spin" />
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-cyan-300 mb-2">
                    Searching the ether...
                  </h2>
                  <p className="text-cyan-200/60 mb-6">
                    Looking for your perfect match.
                  </p>
                  <p className="text-cyan-200/40 text-sm">
                    Auto-refreshing in {nextRefresh}s {refreshing ? '(checking now...)' : ''}
                  </p>
                </div>
              )}

              {status === 'no_match_found' && (
                <div className="border-2 border-purple-400/30 rounded-lg p-8 bg-purple-400/5 backdrop-blur text-center">
                  <h2 className="text-xl font-semibold text-purple-300 mb-4">
                    No Match Today
                  </h2>
                  <p className="text-purple-200/60 mb-6">
                    Your frequency couldn't find a resonant match in today's pool. Try again tomorrow!
                  </p>
                  <Link
                    href="/"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
                  >
                    Back to Home
                  </Link>
                </div>
              )}

              {status === 'received' && receivedMessage && (
                <div className="border-2 border-green-400/50 rounded-lg p-8 bg-green-400/5 backdrop-blur">
                  <div className="mb-6 text-center">
                    <h2 className="text-2xl font-semibold text-green-300">
                      ✓ Match Found
                    </h2>
                    <p className="text-green-200/60 text-sm mt-1">
                      A resonant frequency has reached you
                    </p>
                  </div>

                  <div className="bg-black/40 rounded-lg p-6 border border-purple-400/20 mb-6">
                    <p className="text-white leading-relaxed text-lg">
                      {receivedMessage}
                    </p>
                  </div>

                  <div className="text-center space-y-3">
                    <p className="text-purple-300/60 text-sm">
                      Send another message tomorrow to receive a new match
                    </p>
                    <button
                      onClick={handleReport}
                      className="text-red-400/70 hover:text-red-400 text-xs underline transition-colors"
                    >
                      Report inappropriate content
                    </button>
                  </div>
                </div>
              )}

              <div className="text-center mt-8">
                <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm">
                  ← Back to home
                </Link>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
