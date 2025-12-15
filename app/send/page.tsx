'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Toast from '../components/Toast';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  speed: number;
}

const STAR_COUNT = 150;

export default function SendPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [stars] = useState<Star[]>(() =>
    Array.from({ length: STAR_COUNT }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 2 + 1,
    }))
  );

  // Toast state
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'info';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!message.trim()) {
      setToast({
        message: 'Please enter a message before sending',
        type: 'error'
      });
      return;
    }

    if (message.length < 10) {
      setToast({
        message: 'Message must be at least 10 characters',
        type: 'error'
      });
      return;
    }

    if (message.length > 500) {
      setToast({
        message: 'Message must be less than 500 characters',
        type: 'error'
      });
      return;
    }

    setSending(true);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 429) {
          setToast({
            message: 'You can only send one message per day. Try again tomorrow!',
            type: 'error'
          });
        } else if (response.status === 400) {
          setToast({
            message: data.message || 'Invalid message. Please try again.',
            type: 'error'
          });
        } else {
          setToast({
            message: 'Failed to send message. Please try again.',
            type: 'error'
          });
        }
        setSending(false);
        return;
      }

      // Success!
      if (data.token) {
        localStorage.setItem('vybrix_token', data.token);
      }

      setToast({
        message: 'Message sent! Redirecting...',
        type: 'success'
      });

      // Track success event
      if (typeof window !== 'undefined' && (window as any).plausible) {
        (window as any).plausible('Message Sent');
      }

      setTimeout(() => {
        router.push('/receive');
      }, 1500);

    } catch (error) {
      console.error('Send error:', error);
      setToast({
        message: 'Network error. Please check your connection and try again.',
        type: 'error'
      });
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Toast notifications */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <style jsx>{`
        @keyframes moveStars {
          from { transform: translateX(100vw); }
          to { transform: translateX(-100vw); }
        }
        .moving-star {
          animation: moveStars linear infinite;
        }
      `}</style>

      <div className="fixed inset-0">
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
              animationDuration: `${star.speed * 15}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 text-transparent bg-clip-text">
              Send Your Frequency
            </h1>
            <p className="text-purple-200/70 text-sm md:text-base">
              Share what's on your mind. One message per day.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What's resonating with you today?"
                className="w-full h-48 px-4 py-3 bg-purple-400/10 border-2 border-purple-400/30 rounded-lg text-white placeholder-purple-300/40 focus:outline-none focus:border-cyan-400 transition-colors resize-none"
                maxLength={500}
                disabled={sending}
              />
              <div className="flex justify-between items-center mt-2 text-sm">
                <span className={`${
                  message.length < 10 
                    ? 'text-red-400' 
                    : message.length > 450 
                    ? 'text-yellow-400' 
                    : 'text-purple-300/60'
                }`}>
                  {message.length < 10 ? `${10 - message.length} more characters needed` : `${message.length}/500`}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sending || message.length < 10}
              className="w-full px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white text-xl font-bold rounded-lg hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {sending ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Sending to the cosmos...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          </form>

          <div className="text-center mt-8">
            <Link href="/" className="text-purple-300/60 hover:text-purple-300 text-sm transition-colors">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
