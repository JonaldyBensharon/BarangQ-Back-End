const express = require('express');
const router = express.Router();
const productController = require('../controllers/productControllers');
const auth = require('../middleware/authMiddleware')

router.get('/', auth, productController.handleGetProducts);

router.post('/', auth, productController.handleCreateProduct);

router.put('/:id', auth, productController.handleUpdateProduct);

router.delete('/:id', auth, productController.handleDeleteProduct);

module.exports = router;
