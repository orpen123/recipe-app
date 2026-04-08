const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// POST /api/auth/register - Create new account
router.post('/register', authController.register);

// POST /api/auth/login - Login + get JWT token
router.post('/login', authController.login);

// GET /api/auth/me - Get current user (requires authentication)
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;