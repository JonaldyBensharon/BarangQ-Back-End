const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');

// Ambil data produk
router.get('/', productController.handleGetProducts);

// Buat data produk
router.post('/', productController.handleCreateProduct);

// Update data produk
router.put('/:id', productController.handleUpdateProduct);

// Delete data produk
router.delete('/:id', productController.handleDeleteProduct);

module.exports = router;
