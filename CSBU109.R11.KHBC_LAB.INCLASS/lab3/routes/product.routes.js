// Product routes and Swagger documentation
const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: Product management endpoints
 *
 * components:
 *   schemas:
 *     ProductInput:
 *       type: object
 *       required:
 *         - name
 *         - category
 *         - price
 *       properties:
 *         name:
 *           type: string
 *           example: "Laptop Dell XPS 15"
 *         category:
 *           type: string
 *           enum: [Electronics, Audio, Accessories]
 *           example: "Electronics"
 *         price:
 *           type: number
 *           example: 35000000
 *         stock:
 *           type: integer
 *           example: 10
 *         description:
 *           type: string
 *           example: "High performance laptop with OLED screen"
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID from MongoDB
 *           example: "6ae1ac743fd6e126566723f9"
 *         name:
 *           type: string
 *           example: "Laptop Dell XPS 15"
 *         category:
 *           type: string
 *           example: "Electronics"
 *         price:
 *           type: number
 *           example: 35000000
 *         stock:
 *           type: integer
 *           example: 10
 *         description:
 *           type: string
 *           example: "High performance laptop with OLED screen"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get the list of products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [Electronics, Audio, Accessories]
 *         description: Filter by category
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *         description: Filter products with price >= minPrice
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *         description: Filter products with price <= maxPrice
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Current page (default = 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Items per page (default = 5)
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 1
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *                     totalProducts:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Product'
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created successfully
 *       400:
 *         description: Validation error or missing required fields
 */
router.get('/', productController.getAllProducts);
router.post('/', productController.createProduct);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product details by ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Product details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Invalid or malformed ObjectId
 *       404:
 *         description: No product found with the given ID
 *   put:
 *     summary: Update a product by ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Product updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid ID
 *       404:
 *         description: No product found with the given ID
 *   delete:
 *     summary: Delete a product by ID
 *     tags: [Products]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       400:
 *         description: Invalid or malformed ObjectId
 *       404:
 *         description: No product found with the given ID
 */
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

module.exports = router;