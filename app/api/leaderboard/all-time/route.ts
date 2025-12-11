import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase.rpc('get_all_time_leaderboard');

    if (error) {
      console.error('All-time leaderboard RPC error:', error);
      
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('scores')
        .select('token, score, created_at')
        .order('score', { ascending: false })
        .limit(1000);

      if (fallbackError) throw fallbackError;

      const grouped = new Map();
      fallbackData?.forEach((entry: any) => {
        if (!grouped.has(entry.token) || entry.score > grouped.get(entry.token).score) {
          grouped.set(entry.token, {
            token: entry.token,
            highScore: entry.score,
            date: entry.created_at,
          });
        }
      });

      const leaderboard = Array.from(grouped.values())
        .sort((a, b) => b.highScore - a.highScore)
        .slice(0, 50);

      return NextResponse.json({
        success: true,
        leaderboard,
        count: leaderboard.length,
      });
    }

    const leaderboard = (data || []).map((entry: any) => ({
      token: entry.token,
      highScore: entry.high_score,
      date: entry.date,
    }));

    return NextResponse.json({
      success: true,
      leaderboard,
      count: leaderboard.length,
    });

  } catch (error) {
    console.error('Error fetching all-time leaderboard:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch all-time leaderboard',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
