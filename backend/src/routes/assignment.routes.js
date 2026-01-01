const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const assignmentController = require('../controllers/assignment.controller');
const { validate, schemas } = require('../middleware/validation');

// Get all assignments
router.get('/', authenticateUser, assignmentController.getAssignments);

// Get specific assignment
router.get('/:assignmentId', authenticateUser, assignmentController.getAssignment);

// Create assignment
router.post('/',
  authenticateUser,
  validate(schemas.assignment),
  assignmentController.createAssignment
);

// Update assignment
router.put('/:assignmentId',
  authenticateUser,
  assignmentController.updateAssignment
);

// Update assignment status
router.patch('/:assignmentId/status',
  authenticateUser,
  assignmentController.updateStatus
);

// Delete assignment
router.delete('/:assignmentId', authenticateUser, assignmentController.deleteAssignment);

module.exports = router;
