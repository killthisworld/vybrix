import { NextResponse } from 'next/server';

interface LeaderboardEntry {
  score: number;
  message: string;
  date: string;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || String(new Date().getMonth() + 1);
    const year = searchParams.get('year') || String(new Date().getFullYear());
    
    // TODO: Fetch scores from your database for the specified month/year
    // Filter by date where MONTH(date) = month AND YEAR(date) = year
    // Group by date, get MAX(score) for each date
    // Order by date DESC (most recent first)
    // Return with the message that corresponds to that high score
    
    const leaderboard: LeaderboardEntry[] = [
      // Example structure (sorted by date DESC - most recent first):
      // { score: 150, message: "Example message", date: "2025-11-29" }
    ];
    
    return NextResponse.json({ leaderboard });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
