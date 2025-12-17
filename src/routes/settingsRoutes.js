const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsControllers');
const auth = require('../middlewares/authMiddleware')

router.put('/', auth, settingsController.updateSettings);

module.exports = router;