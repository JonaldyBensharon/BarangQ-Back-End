const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

const authenticateToken = require('../middleware/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.put('/verify-pin', userController.verifyPin);
router.put('/reset-password', userController.resetPassword);
router.get('/info', authenticateToken, userController.handleGetUserInfo);
router.put('/change-password', authenticateToken, userController.changePassword);
router.delete('/delete-account', authenticateToken, userController.deleteAccount);

module.exports = router;