require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function testMatcher() {
  try {
    console.log('🔍 Checking for unmatched messages...');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Check what messages exist
    const allMessages = await pool.query(
      `SELECT m.id, m.content, m.matched_message_id, m.min_deliver_time, m.max_deliver_time
       FROM messages m
       WHERE m.pool_day = $1
       ORDER BY m.created_at ASC`,
      [today]
    );

    console.log(`\n📊 Total messages today: ${allMessages.rows.length}`);
    allMessages.rows.forEach((msg, i) => {
      console.log(`${i + 1}. "${msg.content.substring(0, 40)}..." | Matched: ${msg.matched_message_id ? 'YES' : 'NO'}`);
      console.log(`   Min delivery: ${new Date(msg.min_deliver_time).toLocaleTimeString()}`);
      console.log(`   Max delivery: ${new Date(msg.max_deliver_time).toLocaleTimeString()}`);
      console.log(`   Now: ${now.toLocaleTimeString()}`);
      console.log(`   Past min? ${now >= new Date(msg.min_deliver_time) ? 'YES' : 'NO'}`);
    });

    const unmatched = await pool.query(
      `SELECT m.id, m.content, m.min_deliver_time
       FROM messages m
       WHERE m.pool_day = $1 
         AND m.matched_message_id IS NULL
         AND m.min_deliver_time <= $2`,
      [today, now]
    );

    console.log(`\n🎯 Unmatched messages ready to match: ${unmatched.rows.length}`);
    unmatched.rows.forEach((msg, i) => {
      console.log(`${i + 1}. "${msg.content.substring(0, 40)}..."`);
    });

    if (unmatched.rows.length >= 2) {
      console.log('\n✅ Ready to match! Messages should be paired now.');
    } else {
      console.log('\n⚠️ Need at least 2 unmatched messages to test matching');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testMatcher();
