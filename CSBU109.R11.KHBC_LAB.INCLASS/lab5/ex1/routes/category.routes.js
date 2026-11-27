const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.get('/', protect, categoryController.getCategories);
router.post('/', protect, adminOnly, categoryController.createCategory);
router.put('/:id', protect, adminOnly, categoryController.updateCategory);
router.delete('/:id', protect, adminOnly, categoryController.deleteCategory);

module.exports = router;