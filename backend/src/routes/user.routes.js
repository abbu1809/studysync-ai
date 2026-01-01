const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const userController = require('../controllers/user.controller');
const { validate, schemas } = require('../middleware/validation');

// Get user profile
router.get('/profile', authenticateUser, userController.getProfile);

// Update user profile
router.put('/profile', authenticateUser, userController.updateProfile);

// Update user preferences
router.put('/preferences', 
  authenticateUser, 
  validate(schemas.userPreferences),
  userController.updatePreferences
);

// Get user statistics
router.get('/stats', authenticateUser, userController.getStats);

// Delete user account
router.delete('/account', authenticateUser, userController.deleteAccount);

module.exports = router;
