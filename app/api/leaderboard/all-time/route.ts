import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Get all scores with messages
    const { data, error } = await supabase
      .from('scores')
      .select('token, score, message, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Group by token and keep the highest score entry (with its message)
    const tokenMap = new Map<string, any>();
    
    data?.forEach((scoreEntry) => {
      const existing = tokenMap.get(scoreEntry.token);
      if (!existing || scoreEntry.score > existing.score) {
        tokenMap.set(scoreEntry.token, {
          token: scoreEntry.token,
          highScore: scoreEntry.score,
          message: scoreEntry.message || null,
          date: scoreEntry.created_at
        });
      }
    });

    // Convert to array, sort by score, get top 5
    const leaderboard = Array.from(tokenMap.values())
      .sort((a, b) => {
        if (b.highScore !== a.highScore) {
          return b.highScore - a.highScore;
        }
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      })
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('All-time leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch all-time leaderboard' },
      { status: 500 }
    );
  }
}
