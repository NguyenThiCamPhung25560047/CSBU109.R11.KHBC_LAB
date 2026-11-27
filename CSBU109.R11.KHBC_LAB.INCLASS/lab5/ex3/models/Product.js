const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'categoryId is required']
  },
  quantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  // Extended Requirement 1: Add a status field to the Product schema
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
