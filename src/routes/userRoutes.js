const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// Registrasi user baru
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

// Get info user
router.get('/info', userController.handleGetUserInfo);

// Verifikasi PIN untuk lupa password
router.put('/verify-pin', userController.verifyPin);

// Reset password setelah verifikasi PIN
router.put('/reset-password', userController.resetPassword);

module.exports = router;
