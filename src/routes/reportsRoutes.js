const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsControllers');
const auth = require('../middleware/authMiddleware')

router.get('/', auth, reportsController.getReports);

module.exports = router;