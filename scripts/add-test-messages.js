require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addTestMessages() {
  try {
    console.log('🧪 Adding test messages...');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const minTime = new Date(now.getTime() + 60 * 60 * 1000);
    const maxTime = new Date(now.getTime() + 10 * 60 * 60 * 1000);

    const messages = [
      "I'm feeling lost and unsure about my path forward",
      "Sometimes I wonder if my efforts actually matter",
      "I'm struggling with self-doubt lately",
      "Feeling overwhelmed by all the pressure",
      "Not sure if I'm on the right track",
    ];

    for (const content of messages) {
      // Create user
      const userToken = uuidv4();
      const userResult = await pool.query(
        'INSERT INTO users (anon_token) VALUES ($1) RETURNING id',
        [userToken]
      );
      const userId = userResult.rows[0].id;

      // Create message
      const messageResult = await pool.query(
        `INSERT INTO messages 
         (user_id, content, pool_day, min_deliver_time, max_deliver_time, analysis_done)
         VALUES ($1, $2, $3, $4, $5, TRUE)
         RETURNING id`,
        [userId, content, today, minTime, maxTime]
      );
      const messageId = messageResult.rows[0].id;

      // Add vibe analysis
      await pool.query(
        `INSERT INTO message_vibes
         (message_id, embedding, sentiment_score, emotion_map, intent, 
          polarity_yin_yang, lexical_depth, topic_tags, energy_scalar)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          messageId,
          JSON.stringify(Array(1536).fill(Math.random())),
          -0.5,
          JSON.stringify({ joy: 0.1, sadness: 0.7, anger: 0.1, calm: 0.1 }),
          'venting',
          -0.5,
          0.6,
          ['emotion', 'uncertainty'],
          0.4,
        ]
      );

      console.log(`✅ Added message: "${content.substring(0, 40)}..."`);
    }

    console.log('🎉 Test messages added!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addTestMessages();
