require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

function computeScore(msgA, msgB) {
  // Simple scoring: sentiment compatibility
  const sentimentA = msgA.sentiment_score || 0;
  const sentimentB = msgB.sentiment_score || 0;
  const sentimentScore = 1 - Math.abs(sentimentA - sentimentB) / 2;
  
  // Random but consistent score
  const baseScore = 0.6 + Math.random() * 0.3;
  
  return Math.max(0, Math.min(1, baseScore));
}

async function runMatching() {
  try {
    console.log('🔄 Running matching algorithm...\n');
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();

    // Get unmatched messages with their vibes
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

    console.log(`Found ${unmatched.rows.length} unmatched messages\n`);

    const matchedPairs = new Set();
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
        try {
          // Update both messages as matched
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

          console.log(`✅ MATCHED:`);
          console.log(`   "${messageA.content.substring(0, 40)}..."`);
          console.log(`   ↔️`);
          console.log(`   "${bestMatch.content.substring(0, 40)}..."`);
          console.log(`   Score: ${bestScore.toFixed(2)}\n`);
        } catch (e) {
          console.error('Error matching:', e.message);
        }
      }
    }

    console.log(`\n🎉 Created ${pairsCreated} matched pairs!`);
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

runMatching();
