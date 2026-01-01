const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const studyPlanController = require('../controllers/studyPlan.controller');
const { validate, schemas } = require('../middleware/validation');

// Generate new study plan
router.post('/generate',
  authenticateUser,
  validate(schemas.studyPlanRequest),
  studyPlanController.generatePlan
);

// Get all study plans
router.get('/', authenticateUser, studyPlanController.getPlans);

// Get specific study plan
router.get('/:planId', authenticateUser, studyPlanController.getPlan);

// Update session completion status
router.patch('/:planId/sessions/:sessionId',
  authenticateUser,
  studyPlanController.updateSession
);

// Rebalance plan (regenerate based on missed sessions)
router.post('/:planId/rebalance',
  authenticateUser,
  studyPlanController.rebalancePlan
);

// Delete study plan
router.delete('/:planId', authenticateUser, studyPlanController.deletePlan);

module.exports = router;
