import { NextRequest, NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      );
    }

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

    const userId = userResult.rows[0].id;
    const today = new Date().toISOString().split('T')[0];

    const userMessageResult = await pool.query(
      `SELECT m.*, mv.sentiment_score, mv.emotion_map, mv.intent
       FROM messages m
       LEFT JOIN message_vibes mv ON m.id = mv.message_id
       WHERE m.user_id = $1 AND m.pool_day = $2
       LIMIT 1`,
      [userId, today]
    );

    if (userMessageResult.rows.length === 0) {
      return NextResponse.json({
        status: 'no_message_sent',
        message: 'You haven\'t sent a message yet today',
      });
    }

    const userMessage = userMessageResult.rows[0];

    if (userMessage.matched_message_id && userMessage.delivered) {
      const matchedMessageResult = await pool.query(
        'SELECT content FROM messages WHERE id = $1',
        [userMessage.matched_message_id]
      );

      if (matchedMessageResult.rows.length > 0) {
        return NextResponse.json({
          status: 'received',
          message: matchedMessageResult.rows[0].content,
          matchedAt: userMessage.matched_at,
        });
      }
    }

    const now = new Date();
    const minDeliveryTime = new Date(userMessage.min_deliver_time);
    const maxDeliveryTime = new Date(userMessage.max_deliver_time);

    if (now < minDeliveryTime) {
      const minutesLeft = Math.ceil((minDeliveryTime.getTime() - now.getTime()) / 1000 / 60);
      return NextResponse.json({
        status: 'waiting',
        message: `Your match will arrive in approximately ${minutesLeft} minutes`,
        minutesLeft,
      });
    }

    if (now > maxDeliveryTime && !userMessage.matched_message_id) {
      return NextResponse.json({
        status: 'no_match_found',
        message: 'No matching message was found in the pool today. Try again tomorrow!',
      });
    }

    return NextResponse.json({
      status: 'pending',
      message: 'Looking for your match...',
    });
  } catch (error) {
    console.error('Receive error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch message: ' + String(error) },
      { status: 500 }
    );
  }
}
