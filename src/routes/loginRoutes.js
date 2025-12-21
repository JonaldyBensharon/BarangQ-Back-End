const express = require('express');
const router = express.Router();
const loginController = require('../controllers/loginControllers');
const authenticate = require('../middleware/authMiddleware');

router.post('/register', loginController.registerUser);

router.post('/login', loginController.loginUser);

router.put('/verify-pin', loginController.verifyPin);

router.put('/reset-password', loginController.resetPassword);

router.get('/info', authenticate, loginController.handleGetUserInfoByUsername);

module.exports = router;
