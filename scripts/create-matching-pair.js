require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createMatchingPair() {
  try {
    console.log('🧪 Creating a guaranteed matching pair...');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    
    // Set times so they're past the 1-hour minimum but within 10 hours
    const pastMinTime = new Date(now.getTime() - 70 * 60 * 1000); // 70 min ago
    const futureMaxTime = new Date(now.getTime() + 9 * 60 * 60 * 1000); // 9 hours from now

    const sharedEmbedding = Array(1536).fill(0.5); // Same embedding = perfect match

    // Message 1
    const user1Token = uuidv4();
    const user1Result = await pool.query(
      'INSERT INTO users (anon_token) VALUES ($1) RETURNING id',
      [user1Token]
    );
    const user1Id = user1Result.rows[0].id;

    const msg1Result = await pool.query(
      `INSERT INTO messages 
       (user_id, content, pool_day, min_deliver_time, max_deliver_time, analysis_done)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id`,
      [user1Id, "I'm feeling uncertain about my path", today, pastMinTime, futureMaxTime]
    );
    const msg1Id = msg1Result.rows[0].id;

    await pool.query(
      `INSERT INTO message_vibes
       (message_id, embedding, sentiment_score, emotion_map, intent, 
        polarity_yin_yang, lexical_depth, topic_tags, energy_scalar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        msg1Id,
        JSON.stringify(sharedEmbedding),
        -0.3,
        JSON.stringify({ joy: 0.2, sadness: 0.5, anger: 0.1, calm: 0.2 }),
        'venting',
        -0.3,
        0.5,
        ['emotion'],
        0.5,
      ]
    );
    console.log(`✅ Message 1 created (ID: ${msg1Id})`);

    // Message 2 - very similar
    const user2Token = uuidv4();
    const user2Result = await pool.query(
      'INSERT INTO users (anon_token) VALUES ($1) RETURNING id',
      [user2Token]
    );
    const user2Id = user2Result.rows[0].id;

    const msg2Result = await pool.query(
      `INSERT INTO messages 
       (user_id, content, pool_day, min_deliver_time, max_deliver_time, analysis_done)
       VALUES ($1, $2, $3, $4, $5, TRUE)
       RETURNING id`,
      [user2Id, "I understand that uncertainty, but you're stronger than you think", today, pastMinTime, futureMaxTime]
    );
    const msg2Id = msg2Result.rows[0].id;

    await pool.query(
      `INSERT INTO message_vibes
       (message_id, embedding, sentiment_score, emotion_map, intent, 
        polarity_yin_yang, lexical_depth, topic_tags, energy_scalar)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        msg2Id,
        JSON.stringify(sharedEmbedding),
        0.4,
        JSON.stringify({ joy: 0.4, sadness: 0.1, anger: 0.0, calm: 0.5 }),
        'seeking_advice',
        0.4,
        0.6,
        ['emotion'],
        0.6,
      ]
    );
    console.log(`✅ Message 2 created (ID: ${msg2Id})`);

    console.log('\n📝 Test pair created! Now run the matcher...');
    console.log(`\nToken 1: ${user1Token}`);
    console.log(`Token 2: ${user2Token}`);

    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createMatchingPair();
