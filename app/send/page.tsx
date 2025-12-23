'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';

export default function SendPage() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || message.length < 10) {
      setError('Message must be at least 10 characters');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      let token = localStorage.getItem('userToken');
      if (!token) {
        token = uuidv4();
        localStorage.setItem('userToken', token);
      }

      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: message.trim(), token }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send message');
      }

      // Immediate redirect - no delay
      router.push('/receive');
    } catch (error: any) {
      console.error('Send error:', error);
      setError(error.message || 'Failed to send message');
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <h1 className="text-4xl font-bold text-center mb-8 text-purple-400">
          Send a Message
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write your message to the cosmos..."
            className="w-full h-40 bg-gray-900 text-white border border-purple-500 rounded-lg p-4 focus:outline-none focus:ring-2 focus:ring-purple-400"
            disabled={isSending}
          />

          <div className="text-sm text-gray-400">
            {message.length < 10 && message.length > 0 && (
              <span className="text-red-400">{10 - message.length} more characters needed</span>
            )}
            {message.length >= 10 && (
              <span className="text-purple-400">{message.length} characters</span>
            )}
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSending || message.length < 10}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
          >
            {isSending ? 'Sending...' : 'Send to Cosmos'}
          </button>
        </form>
      </div>
    </div>
  );
}
