require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Lab 5 - Ex 1: Health check hiển thị PID của worker xử lý request
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    pid: process.pid,
    uptime: process.uptime()
  });
});

// Lab 5 - Ex 1: Giả lập crash 1 worker để kiểm tra PM2 auto-restart
app.get('/crash', (req, res) => {
  res.json({ message: `Crashing worker PID ${process.pid}...` });
  setTimeout(() => {
    throw new Error('boom');
  }, 0);
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/categories', categoryRoutes);
app.use('/api/v1/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Endpoint ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 2 MB)!' : err.message;
    return res.status(400).json({ success: false, message });
  }
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => console.log(`ShopAdmin API running at: http://localhost:${PORT} (PID: ${process.pid})`));
