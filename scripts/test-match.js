require('dotenv').config({ path: '.env.local' });
const { runMatchingCycle } = require('../lib/matchingWorker.js');

(async () => {
  console.log('🔄 Running matching cycle...');
  await runMatchingCycle();
  console.log('✅ Done!');
  process.exit(0);
})();
