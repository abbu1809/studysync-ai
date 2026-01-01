const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const habitController = require('../controllers/habit.controller');

// Habit CRUD operations
router.post('/', authenticateUser, habitController.createHabit);
router.get('/', authenticateUser, habitController.getHabits);
router.put('/:habitId', authenticateUser, habitController.updateHabit);
router.delete('/:habitId', authenticateUser, habitController.deleteHabit);

// Habit completion tracking
router.post('/:habitId/complete', authenticateUser, habitController.markHabitComplete);
router.post('/:habitId/uncomplete', authenticateUser, habitController.unmarkHabitComplete);

// Log study session
router.post('/sessions', authenticateUser, habitController.logSession);

// Get study sessions
router.get('/sessions', authenticateUser, habitController.getSessions);

// Analyze habits and update user profile
router.post('/analyze', authenticateUser, habitController.analyzeHabits);

// Get habit insights
router.get('/insights', authenticateUser, habitController.getInsights);

module.exports = router;
