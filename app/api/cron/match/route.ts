import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const SECOND_BEST_THRESHOLD = 0.75;
const MINIMUM_ACCEPTABLE_SCORE = 0.55;

function computeScore(msgA: any, msgB: any): number {
  const sentimentA = msgA.sentiment_score || 0;
  const sentimentB = msgB.sentiment_score || 0;
  
  let sentimentScore;
  if (sentimentA < 0 && sentimentB > 0) {
    sentimentScore = 0.9 + Math.random() * 0.1;
  } else if (Math.abs(sentimentA - sentimentB) < 0.3) {
    sentimentScore = 0.7 + Math.random() * 0.2;
  } else {
    sentimentScore = 0.5 + Math.random() * 0.2;
  }
  
  const intentA = msgA.intent || 'sharing';
  const intentB = msgB.intent || 'sharing';
  
  let intentScore = 0.5;
  if (intentA === 'venting' && intentB === 'sharing') intentScore = 0.8;
  if (intentA === 'seeking_advice' && intentB === 'sharing') intentScore = 0.9;
  
  const energyA = msgA.energy_scalar || 0.5;
  const energyB = msgB.energy_scalar || 0.5;
  const energyScore = 1 - Math.abs(energyA - energyB);
  
  const finalScore = (
    sentimentScore * 0.5 +
    intentScore * 0.3 +
    energyScore * 0.2
  );
  
  return Math.max(0, Math.min(1, finalScore));
}

export async function GET(request: NextRequest) {
  try {
    console.log('🧠 Smart matching triggered');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    const result = await pool.query(
      `SELECT m.id, m.user_id, m.content,
              mv.sentiment_score, mv.emotion_map, mv.intent, mv.energy_scalar
       FROM messages m
       LEFT JOIN message_vibes mv ON m.id = mv.message_id
       WHERE m.pool_day = $1 
         AND m.matched_message_id IS NULL
         AND m.min_deliver_time <= $2
       ORDER BY m.created_at ASC`,
      [today, now]
    );

    const messages = result.rows;

    if (messages.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No messages to match',
        pairsCreated: 0,
      });
    }

    const assignments: Record<string, string> = {};
    const matchCounts: Record<string, number> = {};
    
    messages.forEach(m => {
      matchCounts[m.id] = 0;
    });

    for (const msgA of messages) {
      let bestMatch = null;
      let bestScore = -1;
      let secondBestMatch = null;
      let secondBestScore = -1;
      
      for (const msgB of messages) {
        if (msgA.id === msgB.id) continue;
        
        const score = computeScore(msgA, msgB);
        
        if (score > bestScore) {
          secondBestMatch = bestMatch;
          secondBestScore = bestScore;
          bestMatch = msgB;
          bestScore = score;
        } else if (score > secondBestScore) {
          secondBestMatch = msgB;
          secondBestScore = score;
        }
      }
      
      let chosenMatch = null;
      
      if (!bestMatch) continue;
      
      if (matchCounts[bestMatch.id] === 0) {
        chosenMatch = bestMatch;
      } else if (secondBestMatch && 
                 secondBestScore >= bestScore * SECOND_BEST_THRESHOLD &&
                 secondBestScore >= MINIMUM_ACCEPTABLE_SCORE &&
                 matchCounts[secondBestMatch.id] < matchCounts[bestMatch.id]) {
        chosenMatch = secondBestMatch;
      } else {
        chosenMatch = bestMatch;
      }
      
      if (chosenMatch) {
        assignments[msgA.id] = chosenMatch.id;
        matchCounts[chosenMatch.id]++;
      }
    }

    let savedCount = 0;
    for (const [msgAId, msgBId] of Object.entries(assignments)) {
      try {
        await pool.query(
          `UPDATE messages 
           SET matched_message_id = $1, matched_at = $2, delivered = TRUE
           WHERE id = $3`,
          [msgBId, now, msgAId]
        );
        savedCount++;
      } catch (e) {
        console.error('Match save error:', e);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Smart matching complete: ${savedCount} matches created`,
      pairsCreated: savedCount,
      totalMessages: messages.length,
      matchRate: ((savedCount / messages.length) * 100).toFixed(1) + '%',
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { error: 'Matching failed' },
      { status: 500 }
    );
  }
}
