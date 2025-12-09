const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsControllers');

router.put('/', settingsController.updateSettings);

module.exports = router;
