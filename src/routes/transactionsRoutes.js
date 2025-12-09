const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsControllers');

router.post('/', transactionController.handleTransaction);

module.exports = router;
