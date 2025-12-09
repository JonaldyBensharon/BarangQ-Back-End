const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsControllers');

router.get('/', reportsController.getReports);

module.exports = router;
