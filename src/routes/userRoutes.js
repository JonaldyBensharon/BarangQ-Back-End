const express = require('express');
const router = express.Router();
const userController = require('../controllers/userControllers');

// Registrasi user baru
router.post('/register', userController.registerUser);

// Login user
router.post('/login', userController.loginUser);

module.exports = router;
