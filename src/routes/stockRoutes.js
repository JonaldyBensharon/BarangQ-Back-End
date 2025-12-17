const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockControllers');
const auth = require('../middleware/authMiddleware')

router.post('/add-stock', auth, stockController.handleAddStock);

module.exports = router;