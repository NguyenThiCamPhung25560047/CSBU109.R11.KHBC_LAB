const orderService = require('../services/order.service');

exports.createOrder = async (req, res, next) => {
  try {
    const { customerId, items } = req.body;
    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items must be a non-empty array and customerId is required' });
    }
    for (const item of items) {
      if (!item.quantity || item.quantity <= 0 || !Number.isInteger(item.quantity)) {
        return res.status(400).json({ success: false, error: 'Every item quantity must be a positive integer' });
      }
    }
    const result = await orderService.createOrder(customerId, items);
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.getAllOrders = async (req, res, next) => {
  try {
    const result = await orderService.getAllOrders(req.query);
    res.status(200).json({ success: true, ...result });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.getOrderById = async (req, res, next) => {
  try {
    const data = await orderService.getOrderById(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowed = ['pending', 'completed', 'cancelled'];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status value' });
    }
    const data = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.deleteOrder = async (req, res, next) => {
  try {
    const data = await orderService.deleteOrder(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.getSalesSummary = async (req, res, next) => {
  try {
    const data = await orderService.getSalesSummary();
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};

exports.getCustomerOrderHistory = async (req, res, next) => {
  try {
    const data = await orderService.getCustomerOrderHistory(req.params.id);
    res.status(200).json({ success: true, data });
  } catch (err) {
    res.status(err.status || 500).json({ success: false, error: err.message || 'Server error' });
  }
};