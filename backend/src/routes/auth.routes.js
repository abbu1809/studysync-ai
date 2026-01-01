const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Register new user (handled by Firebase client SDK, but we create Firestore profile)
router.post('/register', authController.register);

// Verify token (for testing)
router.post('/verify', authController.verifyToken);

module.exports = router;
