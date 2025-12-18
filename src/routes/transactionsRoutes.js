const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsControllers');
const auth = require('../middleware/authMiddleware');

// Endpoint untuk mencatat transaksi 
router.post('/', auth, transactionController.handleTransaction);

// Endpoint untuk mengambil detail transaksi berdasarkan transactionId
router.get('/:transactionId', auth, transactionController.getTransactionDetail);

// Endpoint untuk mengambil daftar transaksi milik user 
router.get('/user', auth, transactionController.getUserTransactions);

module.exports = router;