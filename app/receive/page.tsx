'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const STAR_COUNT = 50;

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
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
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
        @keyframes float {
          0%, 100% { transform: translateY(0) translateX(0); }
          25% { transform: translateY(-20px) translateX(10px); }
          50% { transform: translateY(-10px) translateX(-10px); }
          75% { transform: translateY(-25px) translateX(5px); }
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        @keyframes flame {
          0%, 100% { transform: scaleY(1); opacity: 0.8; }
          50% { transform: scaleY(1.3); opacity: 1; }
        }
        
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        
        .spaceship-container {
          animation: float 4s ease-in-out infinite;
        }
        
        .twinkling-star {
          animation: twinkle 2s ease-in-out infinite;
        }
        
        .rocket-flame {
          animation: flame 0.3s ease-in-out infinite;
        }
        
        .loading-dot {
          animation: dotPulse 1.4s ease-in-out infinite;
        }
      `}</style>

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

          {status === 'waiting' && (
            <div className="border-2 border-yellow-500/30 rounded-lg p-12 bg-yellow-500/5 backdrop-blur text-center">
              {/* Spaceship Animation */}
              <div className="relative mb-8 flex justify-center">
                <div className="spaceship-container relative">
                  {/* Twinkling stars around spaceship */}
                  <div className="absolute -top-8 -left-12 w-2 h-2 bg-yellow-300 rounded-full twinkling-star" style={{ animationDelay: '0s' }} />
                  <div className="absolute -top-4 left-20 w-1.5 h-1.5 bg-cyan-300 rounded-full twinkling-star" style={{ animationDelay: '0.5s' }} />
                  <div className="absolute top-12 -right-16 w-2 h-2 bg-purple-300 rounded-full twinkling-star" style={{ animationDelay: '1s' }} />
                  <div className="absolute top-20 -left-8 w-1.5 h-1.5 bg-pink-300 rounded-full twinkling-star" style={{ animationDelay: '1.5s' }} />
                  <div className="absolute -bottom-4 left-16 w-2 h-2 bg-yellow-300 rounded-full twinkling-star" style={{ animationDelay: '0.7s' }} />
                  
                  {/* Spaceship SVG */}
                  <svg width="120" height="120" viewBox="0 0 100 100" className="drop-shadow-2xl">
                    {/* Main body */}
                    <ellipse cx="50" cy="45" rx="18" ry="30" fill="url(#shipGradient)" opacity="0.95" />
                    
                    {/* Window */}
                    <ellipse cx="50" cy="35" rx="7" ry="10" fill="url(#windowGradient)" opacity="0.85" />
                    <ellipse cx="50" cy="33" rx="4" ry="6" fill="#e0f2fe" opacity="0.6" />
                    
                    {/* Left wing */}
                    <path d="M 32 55 L 20 75 L 35 65 Z" fill="url(#wingGradient)" opacity="0.9" />
                    {/* Right wing */}
                    <path d="M 68 55 L 80 75 L 65 65 Z" fill="url(#wingGradient)" opacity="0.9" />
                    
                    {/* Rocket flame - animated */}
                    <ellipse cx="50" cy="75" rx="5" ry="12" fill="#fbbf24" opacity="0.9" className="rocket-flame" />
                    <ellipse cx="50" cy="75" rx="3" ry="8" fill="#fcd34d" opacity="0.8" className="rocket-flame" style={{ animationDelay: '0.15s' }} />
                    
                    {/* Gradients */}
                    <defs>
                      <linearGradient id="shipGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#a855f7" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                      <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#93c5fd" />
                        <stop offset="100%" stopColor="#3b82f6" />
                      </linearGradient>
                      <linearGradient id="wingGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#6d28d9" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>

              {/* Loading text with animated dots */}
              <div className="flex items-center justify-center space-x-2 mb-6">
                <span className="text-yellow-300 text-xl font-medium">Finding your match</span>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full loading-dot" />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full loading-dot" style={{ animationDelay: '0.2s' }} />
                  <div className="w-2 h-2 bg-yellow-400 rounded-full loading-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>

              <p className="text-yellow-200/60 mb-4">
                Your match is on its way. Check back soon.
              </p>
              <p className="text-yellow-200/40 text-sm">
                Auto-refreshing in {nextRefresh}s {refreshing ? '(checking now...)' : ''}
              </p>
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
    </div>
  );
}
