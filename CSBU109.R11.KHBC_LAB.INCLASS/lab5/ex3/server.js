require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const { startDailyInventoryReportJob } = require('./jobs/dailyInventoryReport');
const { startAutoArchiveJob } = require('./jobs/autoArchiveJob');
const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const Product = require('./models/Product');
const seedData = require('./seed');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/categories', categoryRoutes);

// Quick endpoint to re-seed or test
app.post('/api/v1/seed', async (req, res) => {
  try {
    await seedData();
    res.status(200).json({ success: true, message: 'Database seeded successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Step 3: Register the jobs when the server starts inside connectDB().then(...)
connectDB().then(async () => {
  // Auto-seed if database is completely empty
  const count = await Product.countDocuments();
  if (count === 0) {
    console.log('[Server] No products found. Automatically seeding initial demo data...');
    await seedData();
  }

  // Start scheduled background jobs
  startDailyInventoryReportJob();
  startAutoArchiveJob();

  app.listen(PORT, () => {
    console.log(`[Server] ShopAdmin Inventory & Cron API running at: http://localhost:${PORT}`);
  });
}).catch((err) => {
  console.error('[Server] Failed to connect to MongoDB:', err);
});
