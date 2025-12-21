const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsControllers');
const auth = require('../middleware/authMiddleware');

router.post('/', auth, transactionController.handleTransaction);

router.get('/:transactionId', auth, transactionController.getTransactionDetail);

router.get('/user', auth, transactionController.getUserTransactions);

module.exports = router;