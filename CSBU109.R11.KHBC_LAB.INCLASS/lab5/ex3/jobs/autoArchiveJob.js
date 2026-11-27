const cron = require('node-cron');
const Product = require('../models/Product');

function startAutoArchiveJob() {
  // For class testing: run every minute '* * * * *' with a 2-minute window (120,000 ms).
  // In production: run every hour '0 * * * *' with a 24-hour window (24 * 60 * 60 * 1000 ms).
  const WINDOW_MS = process.env.AUTO_ARCHIVE_WINDOW_MS
    ? parseInt(process.env.AUTO_ARCHIVE_WINDOW_MS, 10)
    : 2 * 60 * 1000; // default: 2 minutes for testing

  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Running auto-archive at', new Date().toISOString());
    try {
      const threshold = new Date(Date.now() - WINDOW_MS);

      // Filter: quantity == 0, status is not 'archived', and updatedAt <= threshold
      const result = await Product.updateMany(
        {
          quantity: 0,
          status: { $ne: 'archived' },
          updatedAt: { $lte: threshold }
        },
        {
          $set: { status: 'archived' }
        }
      );

      console.log(`[CRON] Auto-archive: ${result.modifiedCount} product(s) archived`);
    } catch (error) {
      console.error('[CRON] Auto-archive failed:', error.message);
    }
  });
}

module.exports = { startAutoArchiveJob };
