const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');

/**
 * Get all assignments
 */
async function getAssignments(req, res, next) {
  try {
    const { uid } = req.user;
    const { status, priority, subject } = req.query;

    let query = db.collection('assignments').where('userId', '==', uid);

    if (status) {
      query = query.where('status', '==', status);
    }

    if (priority) {
      query = query.where('priority', '==', priority);
    }

    if (subject) {
      query = query.where('subject', '==', subject);
    }

    const snapshot = await query.get();

    const assignments = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          dueDate: data.dueDate?.toDate ? data.dueDate.toDate().toISOString() : data.dueDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt,
          completedAt: data.completedAt?.toDate ? data.completedAt.toDate().toISOString() : data.completedAt,
          daysRemaining: calculateDaysRemaining(data.dueDate),
          hoursRemaining: calculateHoursRemaining(data.dueDate)
        };
      })
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific assignment
 */
async function getAssignment(req, res, next) {
  try {
    const { uid } = req.user;
    const { assignmentId } = req.params;

    const doc = await db.collection('assignments').doc(assignmentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    const assignment = doc.data();

    if (assignment.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      assignment: {
        ...assignment,
        dueDate: assignment.dueDate?.toDate ? assignment.dueDate.toDate().toISOString() : assignment.dueDate,
        createdAt: assignment.createdAt?.toDate ? assignment.createdAt.toDate().toISOString() : assignment.createdAt,
        updatedAt: assignment.updatedAt?.toDate ? assignment.updatedAt.toDate().toISOString() : assignment.updatedAt,
        completedAt: assignment.completedAt?.toDate ? assignment.completedAt.toDate().toISOString() : assignment.completedAt,
        daysRemaining: calculateDaysRemaining(assignment.dueDate),
        hoursRemaining: calculateHoursRemaining(assignment.dueDate)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create new assignment
 */
async function createAssignment(req, res, next) {
  try {
    const { uid } = req.user;
    const assignmentData = req.body;

    const assignment = {
      id: uuidv4(),
      userId: uid,
      documentId: assignmentData.documentId || null,
      title: assignmentData.title,
      subject: assignmentData.subject,
      description: assignmentData.description || '',
      topics: assignmentData.topics || [],
      dueDate: assignmentData.dueDate,
      estimatedHours: assignmentData.estimatedHours || 2,
      actualHours: 0,
      status: 'pending',
      priority: calculatePriority(assignmentData.dueDate),
      difficulty: assignmentData.difficulty || 'medium',
      completedAt: null,
      completionNotes: '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('assignments').doc(assignment.id).set(assignment);

    res.status(201).json({
      success: true,
      message: 'Assignment created successfully',
      assignment
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update assignment
 */
async function updateAssignment(req, res, next) {
  try {
    const { uid } = req.user;
    const { assignmentId } = req.params;
    const updates = req.body;

    const doc = await db.collection('assignments').doc(assignmentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Recalculate priority if due date changed
    if (updates.dueDate) {
      updates.priority = calculatePriority(updates.dueDate);
    }

    updates.updatedAt = FieldValue.serverTimestamp();

    await db.collection('assignments').doc(assignmentId).update(updates);

    res.status(200).json({
      success: true,
      message: 'Assignment updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update assignment status
 */
async function updateStatus(req, res, next) {
  try {
    const { uid } = req.user;
    const { assignmentId } = req.params;
    const { status, actualHours, completionNotes } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Status is required'
      });
    }

    const doc = await db.collection('assignments').doc(assignmentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updateData = {
      status,
      updatedAt: FieldValue.serverTimestamp()
    };

    if (status === 'completed') {
      updateData.completedAt = FieldValue.serverTimestamp();
      
      if (actualHours) {
        updateData.actualHours = actualHours;
      }
      
      if (completionNotes) {
        updateData.completionNotes = completionNotes;
      }

      // Update user stats
      await db.collection('users').doc(uid).update({
        'stats.assignmentsCompleted': FieldValue.increment(1),
        'stats.totalStudyTime': FieldValue.increment(actualHours || 0)
      });
    }

    await db.collection('assignments').doc(assignmentId).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Assignment status updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete assignment
 */
async function deleteAssignment(req, res, next) {
  try {
    const { uid } = req.user;
    const { assignmentId } = req.params;

    const doc = await db.collection('assignments').doc(assignmentId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('assignments').doc(assignmentId).delete();

    res.status(200).json({
      success: true,
      message: 'Assignment deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper: Calculate priority based on due date
 */
function calculatePriority(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  const daysRemaining = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) return 'urgent';
  if (daysRemaining <= 3) return 'high';
  if (daysRemaining <= 7) return 'medium';
  return 'low';
}

/**
 * Helper: Calculate days remaining
 */
function calculateDaysRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due - now) / (1000 * 60 * 60 * 24));
}

/**
 * Helper: Calculate hours remaining
 */
function calculateHoursRemaining(dueDate) {
  const now = new Date();
  const due = new Date(dueDate);
  return Math.ceil((due - now) / (1000 * 60 * 60));
}

module.exports = {
  getAssignments,
  getAssignment,
  createAssignment,
  updateAssignment,
  updateStatus,
  deleteAssignment
};
