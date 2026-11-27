const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { protect, adminOnly } = require('../middlewares/auth.middleware');

router.get('/', protect, productController.getProducts);
router.post('/', protect, adminOnly, productController.createProduct);
router.put('/:id', protect, adminOnly, productController.updateProduct);
router.delete('/:id', protect, adminOnly, productController.deleteProduct);

module.exports = router;
