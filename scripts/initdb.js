require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function init() {
  try {
    console.log('🔧 Testing database connection...');
    console.log('Using DATABASE_URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const result = await pool.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    
    console.log('📦 Creating tables...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        anon_token VARCHAR(255) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_sent_date DATE,
        last_received_date DATE,
        timezone VARCHAR(50) DEFAULT 'UTC',
        locale VARCHAR(10) DEFAULT 'en'
      );
    `);
    console.log('✅ users table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        analysis_done BOOLEAN DEFAULT FALSE,
        matched_message_id UUID REFERENCES messages(id),
        matched_at TIMESTAMP,
        delivered BOOLEAN DEFAULT FALSE,
        received_at TIMESTAMP,
        pool_day DATE NOT NULL,
        min_deliver_time TIMESTAMP NOT NULL,
        max_deliver_time TIMESTAMP NOT NULL
      );
    `);
    console.log('✅ messages table ready');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_vibes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL UNIQUE REFERENCES messages(id) ON DELETE CASCADE,
        embedding TEXT,
        sentiment_score FLOAT,
        emotion_map JSONB,
        intent VARCHAR(100),
        polarity_yin_yang FLOAT,
        lexical_depth FLOAT,
        topic_tags TEXT[],
        energy_scalar FLOAT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('✅ message_vibes table ready');

    console.log('✅ Database fully initialized!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

init();
