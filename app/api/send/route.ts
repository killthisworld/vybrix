import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

interface SendRequest {
  content: string;
  token?: string;
}

async function analyzeMessage(content: string) {
  try {
    // Simple sentiment analysis without calling OpenAI (for now)
    const sentimentScore = content.length > 50 ? 0.5 : -0.2;
    const embedding = Array(1536).fill(Math.random());

    return {
      embedding,
      sentiment_score: sentimentScore,
      emotion_map: { joy: 0.3, sadness: 0.2, anger: 0.1, calm: 0.4 },
      intent: 'sharing',
      energy_scalar: 0.6,
      topic_tags: ['general'],
      polarity_yin_yang: sentimentScore,
      lexical_depth: Math.min(1, content.length / 500),
    };
  } catch (error) {
    console.error('Analysis error:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: SendRequest = await request.json();
    const { content, token } = body;

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    let userId: string;
    let userToken = token;

    if (token) {
      const userResult = await pool.query(
        'SELECT id FROM users WHERE anon_token = $1',
        [token]
      );
      if (userResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Invalid token' },
          { status: 401 }
        );
      }
      userId = userResult.rows[0].id;
    } else {
      userToken = uuidv4();
      const createUserResult = await pool.query(
        'INSERT INTO users (anon_token) VALUES ($1) RETURNING id',
        [userToken]
      );
      userId = createUserResult.rows[0].id;
    }

    const today = new Date().toISOString().split('T')[0];
    const sentToday = await pool.query(
      'SELECT COUNT(*) FROM messages WHERE user_id = $1 AND pool_day = $2',
      [userId, today]
    );

    if (parseInt(sentToday.rows[0].count) > 0) {
      return NextResponse.json(
        { error: 'You can only send one message per day' },
        { status: 429 }
      );
    }

    const analysis = await analyzeMessage(content);
    if (!analysis) {
      return NextResponse.json(
        { error: 'Failed to analyze message' },
        { status: 500 }
      );
    }

    const createdAt = new Date();
    const minDeliveryTime = new Date(createdAt.getTime() + 60 * 60 * 1000);
    const maxDeliveryTime = new Date(createdAt.getTime() + 10 * 60 * 60 * 1000);

    const messageResult = await pool.query(
      `INSERT INTO messages 
       (user_id, content, pool_day, min_deliver_time, max_deliver_time, analysis_done)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id`,
      [userId, content, today, minDeliveryTime, maxDeliveryTime]
    );

    const messageId = messageResult.rows[0].id;

    await pool.query(
      `INSERT INTO message_vibes
       (message_id, embedding, sentiment_score, emotion_map, intent, 
        polarity_yin_yang, lexical_depth, topic_tags, energy_scalar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        messageId,
        JSON.stringify(analysis.embedding),
        analysis.sentiment_score,
        JSON.stringify(analysis.emotion_map),
        analysis.intent,
        analysis.polarity_yin_yang,
        analysis.lexical_depth,
        analysis.topic_tags,
        analysis.energy_scalar,
      ]
    );

    return NextResponse.json({
      success: true,
      token: userToken,
      messageId,
      message: 'Message sent!',
    });
  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { error: 'Failed to send message: ' + String(error) },
      { status: 500 }
    );
  }
}
