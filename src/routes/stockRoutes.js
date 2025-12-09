const express = require('express');
const router = express.Router();
const stockController = require('../controllers/stockControllers');

router.post('/add-stock', stockController.handleAddStock);

module.exports = router;
