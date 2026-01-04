const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../middleware/auth');
const emailService = require('../services/email.service');
const notificationService = require('../services/notification.service');
const { db } = require('../config/firebase');

/**
 * Send test welcome email
 * POST /api/notifications/test-welcome
 */
router.post('/test-welcome', authenticateUser, async (req, res, next) => {
  try {
    const result = await emailService.sendWelcomeEmail(
      req.user.email,
      req.user.displayName
    );

    res.json({
      success: true,
      message: 'Test email sent',
      result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get pending tasks and send summary email
 * POST /api/notifications/pending-summary
 */
router.post('/pending-summary', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.uid;

    // Fetch pending assignments
    const assignmentsSnapshot = await db.collection('assignments')
      .where('userId', '==', userId)
      .where('status', '!=', 'completed')
      .get();

    const assignments = assignmentsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => new Date(a.dueDate) >= new Date());

    // Fetch incomplete habits for today
    const today = new Date().toISOString().split('T')[0];
    const habitsSnapshot = await db.collection('habits')
      .where('userId', '==', userId)
      .get();

    const habits = habitsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(h => {
        const todayLog = h.completionLog?.[today];
        return !todayLog || !todayLog.completed;
      });

    // Fetch active study plans
    const studyPlansSnapshot = await db.collection('studyPlans')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .get();

    const studyPlans = studyPlansSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const result = await emailService.sendPendingTasksSummary(
      req.user.email,
      req.user.displayName,
      { assignments, habits, studyPlans }
    );

    res.json({
      success: true,
      message: 'Pending tasks summary sent',
      count: {
        assignments: assignments.length,
        habits: habits.length,
        studyPlans: studyPlans.length
      },
      result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check for upcoming deadlines and send reminders
 * POST /api/notifications/deadline-check
 */
router.post('/deadline-check', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get assignments due in the next 3 days
    const assignmentsSnapshot = await db.collection('assignments')
      .where('userId', '==', userId)
      .where('status', '!=', 'completed')
      .get();

    const upcomingAssignments = assignmentsSnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(a => {
        const dueDate = new Date(a.dueDate);
        return dueDate >= now && dueDate <= threeDaysFromNow;
      });

    const emailResults = [];
    for (const assignment of upcomingAssignments) {
      const result = await emailService.sendDeadlineReminder(
        req.user.email,
        req.user.displayName,
        assignment
      );
      emailResults.push({ assignment: assignment.title, result });
    }

    res.json({
      success: true,
      message: `Checked ${upcomingAssignments.length} upcoming deadline(s)`,
      reminders: emailResults
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Update notification preferences
 * PUT /api/notifications/preferences
 */
router.put('/preferences', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.uid;
    const { emailNotifications, deadlineReminders, dailySummary } = req.body;

    const userRef = db.collection('users').doc(userId);
    await userRef.update({
      'preferences.emailNotifications': emailNotifications !== undefined ? emailNotifications : true,
      'preferences.deadlineReminders': deadlineReminders !== undefined ? deadlineReminders : true,
      'preferences.dailySummary': dailySummary !== undefined ? dailySummary : false,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Notification preferences updated',
      preferences: {
        emailNotifications,
        deadlineReminders,
        dailySummary
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Batch endpoint: Send deadline reminders to all users
 * POST /api/notifications/batch/deadline-reminders
 * (Used by scheduled GitHub Actions)
 */
router.post('/batch/deadline-reminders', async (req, res, next) => {
  try {
    const result = await notificationService.sendBatchDeadlineReminders();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * Batch endpoint: Send daily summaries to opted-in users
 * POST /api/notifications/batch/daily-summary
 * (Used by scheduled GitHub Actions)
 */
router.post('/batch/daily-summary', async (req, res, next) => {
  try {
    const result = await notificationService.sendBatchDailySummary();
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
