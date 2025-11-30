import { NextResponse } from 'next/server';

interface LeaderboardEntry {
  score: number;
  message: string;
  date: string;
}

export async function GET() {
  try {
    // TODO: Fetch top score for each day from your database
    // Group by date, get MAX(score) for each date
    // Return with the message that corresponds to that high score
    // Only show dates before today (so current day can accumulate)
    
    const leaderboard: LeaderboardEntry[] = [
      // Example structure:
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
