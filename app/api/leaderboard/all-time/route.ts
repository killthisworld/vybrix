import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    // Get top 5 all-time high scores with messages
    const { data, error } = await supabase
      .from('scores')
      .select('token, score, message, created_at')
      .order('score', { ascending: false })
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;

    // Group by token and get highest score for each
    const tokenMap = new Map<string, any>();
    
    data?.forEach((score) => {
      const existing = tokenMap.get(score.token);
      if (!existing || score.score > existing.score) {
        tokenMap.set(score.token, {
          token: score.token,
          highScore: score.score,
          message: score.message,
          date: score.created_at
        });
      }
    });

    // Convert to array and get top 5
    const leaderboard = Array.from(tokenMap.values())
      .sort((a, b) => b.highScore - a.highScore)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      leaderboard,
      count: leaderboard.length
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
