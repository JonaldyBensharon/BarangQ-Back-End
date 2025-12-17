const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const auth = require('../middlewares/authMiddleware')

// Ambil data produk
router.get('/', auth, productController.handleGetProducts);

// Buat data produk
router.post('/', auth, productController.handleCreateProduct);

// Update data produk
router.put('/:id', auth, productController.handleUpdateProduct);

// Delete data produk
router.delete('/:id', auth, productController.handleDeleteProduct);

module.exports = router;
