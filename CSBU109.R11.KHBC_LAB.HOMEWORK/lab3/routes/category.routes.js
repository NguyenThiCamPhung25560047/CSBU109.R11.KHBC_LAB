// Category routes and Swagger documentation
const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { validateCategory, validateCategoryPatch } = require('../middlewares/category.validation');

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category management endpoints
 *
 * components:
 *   schemas:
 *     CategoryInput:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: "Home & Living"
 *         description:
 *           type: string
 *           example: "Furniture and household supplies"
 *     CategoryPatch:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           minLength: 3
 *           example: "Home & Kitchen"
 *         description:
 *           type: string
 *           example: "Kitchen appliances and cookware"
 *     Category:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID from MongoDB
 *           example: "6ae1c66e6c55e4e448e5cdb1"
 *         name:
 *           type: string
 *           example: "Home & Living"
 *         slug:
 *           type: string
 *           example: "home-living"
 *         description:
 *           type: string
 *           example: "Furniture and household supplies"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: Get the list of categories
 *     tags: [Categories]
 *     parameters:
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
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           example: "-createdAt"
 *         description: Field to sort by (prefix with '-' for descending, e.g. name, -name, createdAt)
 *     responses:
 *       200:
 *         description: Categories retrieved successfully
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
 *                     totalCategories:
 *                       type: integer
 *                       example: 1
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Category'
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Invalid input or name shorter than 3 characters
 *       409:
 *         description: Category name or slug already exists
 */
router.get('/', categoryController.getAllCategories);
router.post('/', validateCategory, categoryController.createCategory);

/**
 * @swagger
 * /categories/{id}:
 *   get:
 *     summary: Get category details by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Category details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid or malformed ObjectId
 *       404:
 *         description: No category found with the given ID
 *   patch:
 *     summary: Partially update a category
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryPatch'
 *     responses:
 *       200:
 *         description: Category updated successfully
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input or malformed ObjectId
 *       404:
 *         description: No category found to update
 *       409:
 *         description: Category name or slug already exists
 *   put:
 *     summary: Replace/update category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CategoryInput'
 *     responses:
 *       200:
 *         description: Category replaced successfully
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
 *                   example: "Category updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Category'
 *       400:
 *         description: Invalid input or malformed ObjectId
 *       404:
 *         description: No category found to update
 *       409:
 *         description: Category name or slug already exists
 *   delete:
 *     summary: Delete a category by ID
 *     tags: [Categories]
 *     parameters:
 *       - $ref: '#/components/parameters/idParam'
 *     responses:
 *       200:
 *         description: Category deleted successfully
 *       400:
 *         description: Invalid or malformed ObjectId
 *       404:
 *         description: No category found to delete
 */
router.get('/:id', categoryController.getCategoryById);
router.patch('/:id', validateCategoryPatch, categoryController.updateCategory);
router.put('/:id', validateCategory, categoryController.replaceCategory);
router.delete('/:id', categoryController.deleteCategory);

module.exports = router;