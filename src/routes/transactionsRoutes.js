const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionsControllers');
const auth = require('../middleware/authMiddleware')

router.post('/', auth, transactionController.handleTransaction);

module.exports = router;
