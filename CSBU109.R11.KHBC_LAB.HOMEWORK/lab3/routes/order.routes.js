const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order & Inventory management endpoints (Homework - MySQL)
 */

/**
 * @swagger
 * /api/v1/orders:
 *   post:
 *     summary: Create a new order (SQL Transaction & Stock Lock)
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - items
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 1
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - productId
 *                     - quantity
 *                   properties:
 *                     productId:
 *                       type: integer
 *                       example: 1
 *                     quantity:
 *                       type: integer
 *                       example: 2
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Product out of stock or invalid payload
 *       404:
 *         description: Customer or product not found
 *   get:
 *     summary: Get all orders (Filter & Pagination)
 *     tags: [Orders]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, completed, cancelled]
 *         description: Filter orders by status
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: Filter orders by customer ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: Successfully retrieved order list
 */
router.post('/orders', orderController.createOrder);
router.get('/orders', orderController.getAllOrders);

/**
 * @swagger
 * /api/v1/orders/analytics/sales-summary:
 *   get:
 *     summary: Get sales summary analytics and top-selling products
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Successfully retrieved sales analytics
 */
router.get('/orders/analytics/sales-summary', orderController.getSalesSummary);

/**
 * @swagger
 * /api/v1/orders/{id}:
 *   get:
 *     summary: Get order details by ID (Multi-table JOIN)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target Order ID
 *     responses:
 *       200:
 *         description: Successfully retrieved order details
 *       404:
 *         description: Order not found
 *   delete:
 *     summary: Delete order by ID (Restore inventory if not cancelled)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target Order ID
 *     responses:
 *       200:
 *         description: Order deleted successfully
 *       404:
 *         description: Order not found
 */
router.get('/orders/:id', orderController.getOrderById);
router.delete('/orders/:id', orderController.deleteOrder);

/**
 * @swagger
 * /api/v1/orders/{id}/status:
 *   patch:
 *     summary: Update order status (Restores stock if cancelled)
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed, cancelled]
 *                 example: completed
 *     responses:
 *       200:
 *         description: Order status updated successfully
 *       400:
 *         description: Invalid status or order already cancelled
 *       404:
 *         description: Order not found
 */
router.patch('/orders/:id/status', orderController.updateOrderStatus);

/**
 * @swagger
 * /api/v1/customers/{id}/order-history:
 *   get:
 *     summary: Get customer order history and total lifetime spend
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Target Customer ID
 *     responses:
 *       200:
 *         description: Successfully retrieved customer order history
 *       404:
 *         description: Customer not found
 */
router.get('/customers/:id/order-history', orderController.getCustomerOrderHistory);

module.exports = router;