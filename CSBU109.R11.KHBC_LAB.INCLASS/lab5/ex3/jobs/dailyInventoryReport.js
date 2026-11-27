const cron = require('node-cron');
const Product = require('../models/Product');

function startDailyInventoryReportJob() {
  // For testing, run every minute: '* * * * *'. In production: '0 0 * * *' (midnight).
  cron.schedule('* * * * *', async () => {
    console.log('[CRON] Running inventory report at', new Date().toISOString());
    try {
      const report = await Product.aggregate([
        {
          $group: {
            _id: '$categoryId',
            totalProducts: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' },
            stockValue: { $sum: { $multiply: ['$price', '$quantity'] } }
          }
        },
        {
          $lookup: {
            from: 'categories',
            localField: '_id',
            foreignField: '_id',
            as: 'categoryDoc'
          }
        },
        {
          $unwind: {
            path: '$categoryDoc',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $project: {
            _id: 0,
            totalProducts: 1,
            totalQuantity: 1,
            stockValue: 1,
            category: { $ifNull: ['$categoryDoc.name', 'Uncategorized'] }
          }
        },
        {
          $sort: { stockValue: -1 }
        }
      ]);

      console.log('[CRON] Inventory by category:');
      console.table(report);
    } catch (error) {
      console.error('[CRON] Inventory report failed:', error.message);
    }
  });
}

module.exports = { startDailyInventoryReportJob };
