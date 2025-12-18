const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsControllers');
const authenticateToken = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

router.get('/', authenticateToken, settingsController.getStoreInfo);
router.put('/', authenticateToken, upload.single('store_image'), settingsController.updateStoreInfo);

module.exports = router;