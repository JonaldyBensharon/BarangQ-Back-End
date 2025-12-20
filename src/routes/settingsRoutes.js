const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsControllers');
const authenticateToken = require('../middleware/authMiddleware'); 
const upload = require('../middleware/uploadMiddleware');

router.get('/', authenticateToken, settingsController.getStoreInfo);

router.put('/', authenticateToken, upload.single('store_image'), settingsController.updateStoreInfo);

router.put('/verify-pin', authenticateToken, settingsController.verifyPin);

router.put('/change-password', authenticateToken, settingsController.changePassword);

router.put('/reset-password', authenticateToken, settingsController.resetPassword);

router.delete('/delete-account', authenticateToken, settingsController.deleteAccount);

module.exports = router;