const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const analyticsController = require('../controllers/analytics.controller');

// Get analytics data for dashboard
router.get('/',
  authenticateUser,
  analyticsController.getAnalytics
);

module.exports = router;
