const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginControllers');
const authenticate = require('../middleware/authMiddleware');

// Registrasi user baru
router.post('/register', loginController.registerUser);

// Login user
router.post('/login', loginController.loginUser);

// Verifikasi PIN untuk lupa password
router.put('/verify-pin', loginController.verifyPin);

// Reset password setelah verifikasi PIN
router.put('/reset-password', loginController.resetPassword);

// Get info user
router.get('/info', authenticate, loginController.handleGetUserInfoByUsername);

module.exports = router;
