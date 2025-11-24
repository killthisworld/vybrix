'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

const STAR_COUNT = 50;

export default function SendPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stars, setStars] = useState<Star[]>([]);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const newStars = Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.5,
    }));
    setStars(newStars);
    
    const savedEmail = localStorage.getItem('vybrix_email');
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('vybrix_token');

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: message,
          email: email || undefined,
          token: token || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send message');
        return;
      }

      localStorage.setItem('vybrix_token', data.token);
      
      if (email) {
        localStorage.setItem('vybrix_email', email);
      }
      
      // Save today's date to prevent multiple sends
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem('vybrix_last_sent_date', today);
      
      setSuccess(true);
      setMessage('');

      setTimeout(() => {
        router.push('/receive');
      }, 2000);
    } catch (err) {
      setError('Network error. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
              Share Your Frequency
            </h1>
            <p className="text-purple-200/60">
              What's on your mind? Your authentic message will find its match.
            </p>
          </div>

          {success ? (
            <div className="border-2 border-green-500 rounded-lg p-8 bg-green-500/5 backdrop-blur text-center">
              <h2 className="text-2xl font-semibold text-green-400 mb-2">Message Sent!</h2>
              <p className="text-green-300/80 mb-4">
                Your frequency has been added to the ether. {email && "We'll email you when your match is ready."}
              </p>
              <p className="text-green-200/60 text-sm">Check back between 1-10 hours for your resonant response.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your truth..."
                  className="w-full h-48 px-4 py-3 bg-purple-400/10 border-2 border-purple-400/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                  disabled={loading}
                />
              </div>

              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email (optional - get notified when matched)"
                  className="w-full px-4 py-3 bg-purple-400/10 border-2 border-purple-400/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                  disabled={loading}
                />
                <p className="text-purple-300/40 text-xs mt-2">
                  {email ? '✅ Email saved - we\'ll use this for future notifications' : '✨ Get notified when your match arrives (1-10 hours)'}
                </p>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-purple-300/60 text-sm">
                  {message.length} characters
                </span>
              </div>

              {error && (
                <div className="border-l-4 border-red-500 bg-red-500/10 p-4 rounded text-red-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || message.trim().length === 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>

              <div className="text-center">
                <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm">
                  ← Back to home
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
