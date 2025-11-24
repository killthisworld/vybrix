require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function addEmailColumn() {
  try {
    console.log('📧 Adding email column to messages table...');
    
    await pool.query(`
      ALTER TABLE messages 
      ADD COLUMN IF NOT EXISTS user_email VARCHAR(255);
    `);
    
    console.log('✅ Email column added!');
    
    console.log('📊 Adding resonance feedback table...');
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS message_feedback (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
        resonated BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    console.log('✅ Feedback table created!');
    
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addEmailColumn();
