const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const resourceController = require('../controllers/resource.controller');

// Get recommended resources for a topic
router.get('/recommendations', authenticateUser, resourceController.getRecommendations);

// Mark resource as viewed
router.post('/:resourceId/view', authenticateUser, resourceController.markAsViewed);

// Mark resource as helpful/not helpful
router.post('/:resourceId/feedback', authenticateUser, resourceController.submitFeedback);

module.exports = router;
