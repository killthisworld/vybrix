import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function computeScore(msgA: any, msgB: any): number {
  const sentimentA = msgA.sentiment_score || 0;
  const sentimentB = msgB.sentiment_score || 0;
  const sentimentScore = 1 - Math.abs(sentimentA - sentimentB) / 2;
  const baseScore = 0.6 + Math.random() * 0.3;
  return Math.max(0, Math.min(1, baseScore));
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Matching worker triggered');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const unmatched = await pool.query(
      `SELECT m.id, m.user_id, m.content,
              mv.sentiment_score, mv.emotion_map, mv.intent
       FROM messages m
       LEFT JOIN message_vibes mv ON m.id = mv.message_id
       WHERE m.pool_day = $1 
         AND m.matched_message_id IS NULL
         AND m.min_deliver_time <= $2
       ORDER BY m.created_at ASC`,
      [today, now]
    );

    const matchedPairs = new Set<string>();
    let pairsCreated = 0;

    for (let i = 0; i < unmatched.rows.length; i++) {
      const messageA = unmatched.rows[i];
      if (matchedPairs.has(messageA.id)) continue;

      let bestMatch = null;
      let bestScore = -1;

      for (let j = i + 1; j < unmatched.rows.length; j++) {
        const messageB = unmatched.rows[j];
        if (matchedPairs.has(messageB.id)) continue;

        const score = computeScore(messageA, messageB);
        if (score > bestScore) {
          bestScore = score;
          bestMatch = messageB;
        }
      }

      if (bestMatch && bestScore > 0.5) {
        await pool.query(
          `UPDATE messages 
           SET matched_message_id = $1, matched_at = $2, delivered = TRUE
           WHERE id = $3`,
          [bestMatch.id, now, messageA.id]
        );

        await pool.query(
          `UPDATE messages 
           SET matched_message_id = $1, matched_at = $2, delivered = TRUE
           WHERE id = $3`,
          [messageA.id, now, bestMatch.id]
        );

        matchedPairs.add(messageA.id);
        matchedPairs.add(bestMatch.id);
        pairsCreated++;
      }
    }

    return NextResponse.json({
      success: true,
      pairsCreated,
      message: `Created ${pairsCreated} matched pairs`,
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { error: 'Matching failed' },
      { status: 500 }
    );
  }
}
