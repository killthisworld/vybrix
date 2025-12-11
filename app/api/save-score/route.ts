import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token, score } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    if (typeof score !== 'number' || score < 0) {
      return NextResponse.json(
        { success: false, message: 'Valid score (>= 0) is required' },
        { status: 400 }
      );
    }

    if (score > 100000) {
      console.warn(`Suspicious score detected: ${score} from token ${token}`);
      return NextResponse.json(
        { success: false, message: 'Score exceeds maximum limit' },
        { status: 400 }
      );
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const { data: existingScores } = await supabase
      .from('scores')
      .select('score, id')
      .eq('token', token)
      .gte('created_at', startOfDay.toISOString())
      .lte('created_at', endOfDay.toISOString())
      .order('score', { ascending: false })
      .limit(1);

    if (existingScores && existingScores.length > 0) {
      const existingScore = existingScores[0];
      
      if (score > existingScore.score) {
        const { data, error } = await supabase
          .from('scores')
          .update({ score, created_at: new Date().toISOString() })
          .eq('id', existingScore.id)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          message: 'High score updated!',
          data: {
            token,
            score,
            previousScore: existingScore.score,
            isNewHigh: true,
          },
        });
      } else {
        return NextResponse.json({
          success: true,
          message: 'Score recorded (not a new high)',
          data: {
            token,
            score,
            highScore: existingScore.score,
            isNewHigh: false,
          },
        });
      }
    } else {
      const { data, error } = await supabase
        .from('scores')
        .insert({
          token,
          score,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        message: 'Score saved successfully',
        data: {
          token,
          score,
          isNewHigh: true,
        },
      });
    }
  } catch (error) {
    console.error('Error saving score:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to save score', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
