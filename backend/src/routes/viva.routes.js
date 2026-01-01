const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const vivaController = require('../controllers/viva.controller');
const analyticsController = require('../controllers/analytics.controller');
const { validate, schemas } = require('../middleware/validation');

// Generate viva questions (including MCQs)
router.post('/generate',
  authenticateUser,
  validate(schemas.vivaRequest),
  analyticsController.generateVivaQuestions
);

// Submit viva/MCQ answers
router.post('/submit',
  authenticateUser,
  analyticsController.submitVivaAnswers
);

// Get viva results history
router.get('/results',
  authenticateUser,
  analyticsController.getVivaResults
);

// Get all viva questions (old endpoint - keep for compatibility)
router.get('/', authenticateUser, vivaController.getQuestions);

// Submit answer to question (old endpoint - keep for compatibility)
router.post('/:questionId/answer',
  authenticateUser,
  vivaController.submitAnswer
);

// Delete question
router.delete('/:questionId', authenticateUser, vivaController.deleteQuestion);

module.exports = router;
