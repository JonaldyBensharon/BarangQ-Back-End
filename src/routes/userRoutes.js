const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');
const auth = require('../middlewares/authMiddleware')

// Registrasi user baru
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Verifikasi PIN untuk lupa password
router.put('/verify-pin', userController.verifyPin);

// Reset password setelah verifikasi PIN
router.put('/reset-password', userController.resetPassword);

// Get info user
router.get('/info', auth, userController.handleGetUserInfo);

module.exports = router;
