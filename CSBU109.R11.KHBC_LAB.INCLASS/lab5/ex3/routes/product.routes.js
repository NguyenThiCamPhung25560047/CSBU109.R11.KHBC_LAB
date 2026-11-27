const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

// GET /api/v1/products - List all products
router.get('/', async (req, res) => {
  try {
    const filter = {};
    if (req.query.categoryId) {
      filter.categoryId = req.query.categoryId;
    }
    const products = await Product.find(filter).populate('categoryId', 'name');
    res.status(200).json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/v1/products/:id - Get a single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoryId', 'name');
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/v1/products - Create a product
router.post('/', async (req, res) => {
  try {
    const { name, categoryId, quantity, price, status } = req.body;
    const product = await Product.create({
      name,
      categoryId,
      quantity: quantity !== undefined ? Number(quantity) : 0,
      price: Number(price),
      status: status || 'active'
    });
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PUT /api/v1/products/:id - Update product (used in class testing for auto-archive)
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.quantity !== undefined) updates.quantity = Number(updates.quantity);
    if (updates.price !== undefined) updates.price = Number(updates.price);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    res.status(200).json({ success: true, message: 'Product updated', data: product });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// DELETE /api/v1/products/:id - Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.status(200).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
