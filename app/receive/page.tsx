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
            <div className="border-2 border-yellow-500/50 rounded-lg p-8 bg-yellow-500/5 backdrop-blur text-center">
              <div className="mb-6">
                <div className="inline-block">
                  <div className="w-12 h-12 border-3 border-yellow-500/20 border-t-yellow-400 rounded-full animate-spin" />
                </div>
              </div>
              <h2 className="text-xl font-semibold text-yellow-300 mb-2">
                Still listening...
              </h2>
              <p className="text-yellow-200/60 mb-6">
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

              <div className="text-center">
                <p className="text-purple-300/60 text-sm">
                  Send another message tomorrow to receive a new match
                </p>
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
