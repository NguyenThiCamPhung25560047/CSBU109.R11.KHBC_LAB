const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let products = [
  { id: 1, name: 'Laptop Dell XPS 15', price: 35000000, category: 'Electronics' },
  { id: 2, name: 'Logitech MX Master 3S Mouse', price: 2400000, category: 'Accessories' },
  { id: 3, name: 'iPhone 15 Pro Max', price: 30000000, category: 'Electronics' }
];

app.get('/api/v1/products', (req, res) => {
  const { category } = req.query;
  let filteredProducts = products;

  if (category && category !== 'All Categories') {
    filteredProducts = products.filter(
      p => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  res.json({
    success: true,
    count: filteredProducts.length,
    data: filteredProducts
  });
});

app.post('/api/v1/products', (req, res) => {
  const { name, price, category } = req.body;
  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Product name and price are required!'
    });
  }

  const newProduct = {
    id: Date.now(),
    name,
    price: Number(price),
    category: category || 'General'
  };

  products.push(newProduct);
  res.status(201).json({
    success: true,
    message: 'Product added successfully',
    data: newProduct
  });
});

app.put('/api/v1/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const { name, price, category } = req.body;

  const productIndex = products.findIndex(p => p.id === productId);
  if (productIndex === -1) {
    return res.status(404).json({
      success: false,
      message: `Product ID ${productId} not found`
    });
  }

  if (!name || !price) {
    return res.status(400).json({
      success: false,
      message: 'Product name and price cannot be empty!'
    });
  }

  products[productIndex] = {
    id: productId,
    name,
    price: Number(price),
    category: category || products[productIndex].category
  };

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: products[productIndex]
  });
});

app.delete('/api/v1/products/:id', (req, res) => {
  const productId = Number(req.params.id);
  const exists = products.some(p => p.id === productId);

  if (!exists) {
    return res.status(404).json({
      success: false,
      message: `Product ID ${productId} not found`
    });
  }

  products = products.filter(p => p.id !== productId);
  res.json({
    success: true,
    message: `Deleted product ID ${productId}`
  });
});

app.listen(PORT, () => {
  console.log(`Backend API running at: http://localhost:${PORT}`);
});