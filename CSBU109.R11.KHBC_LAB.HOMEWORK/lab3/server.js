require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const productRoutes = require('./routes/product.routes');
const categoryRoutes = require('./routes/category.routes');
const orderRoutes = require('./routes/order.routes'); 
const setupSwagger = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/shop_lab3_db';

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

setupSwagger(app);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/v1', orderRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
});

app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  let status = err.status || 500;
  let message = err.message || 'Internal server error';

  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  }

  if (err.name === 'CastError') {
    status = 400;
    message = `Malformed ObjectId for ${err.path}: '${err.value}'`;
  }

  if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyPattern || err.keyValue || {})[0] || 'field';
    const val = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate key error: '${val}' already exists for field '${field}'.`;
  }

  res.status(status).json({
    success: false,
    error: message
  });
});

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Successfully connected to MongoDB database');
    app.listen(PORT, () => {
      console.log(`Server is running at: http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });

module.exports = app;