import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { token, score } = await request.json();
    
    // TODO: Save score to your database
    // This should save: token, score, date, and the user's original message
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save score' },
      { status: 500 }
    );
  }
}
