const { db } = require('../config/firebase');
const emailService = require('../services/email.service');

/**
 * Batch notification service for scheduled jobs
 * Processes all users and sends appropriate notifications
 */

/**
 * Send deadline reminders to all users with upcoming assignments
 */
async function sendBatchDeadlineReminders() {
  try {
    const now = new Date();
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    console.log('🔍 Checking for upcoming deadlines...');

    // Get all assignments due in next 3 days
    const assignmentsSnapshot = await db.collection('assignments')
      .where('status', '!=', 'completed')
      .get();

    const assignmentsByUser = {};
    
    assignmentsSnapshot.docs.forEach(doc => {
      const assignment = { id: doc.id, ...doc.data() };
      const dueDate = new Date(assignment.dueDate);
      
      // Check if due within 3 days
      if (dueDate >= now && dueDate <= threeDaysFromNow) {
        if (!assignmentsByUser[assignment.userId]) {
          assignmentsByUser[assignment.userId] = [];
        }
        assignmentsByUser[assignment.userId].push(assignment);
      }
    });

    const userIds = Object.keys(assignmentsByUser);
    console.log(`📧 Found ${userIds.length} users with upcoming deadlines`);

    let sentCount = 0;
    let errorCount = 0;

    // Process each user
    for (const userId of userIds) {
      try {
        // Get user info
        const userDoc = await db.collection('users').doc(userId).get();
        if (!userDoc.exists) continue;

        const user = userDoc.data();
        
        // Check if user wants deadline reminders
        if (user.preferences?.deadlineReminders === false || 
            user.preferences?.emailNotifications === false) {
          console.log(`⏭️ Skipping ${user.email} - notifications disabled`);
          continue;
        }

        // Send reminder for each assignment
        const assignments = assignmentsByUser[userId];
        for (const assignment of assignments) {
          const result = await emailService.sendDeadlineReminder(
            user.email,
            user.displayName,
            assignment
          );
          
          if (result.success) {
            sentCount++;
            console.log(`✅ Sent reminder to ${user.email} for "${assignment.title}"`);
          } else {
            errorCount++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing user ${userId}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✨ Batch deadline reminders complete: ${sentCount} sent, ${errorCount} errors`);
    
    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
      totalUsers: userIds.length
    };
  } catch (error) {
    console.error('Error in batch deadline reminders:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Send daily summary to users who opted in
 */
async function sendBatchDailySummary() {
  try {
    console.log('📊 Generating daily summaries...');

    // Get all users who want daily summaries
    const usersSnapshot = await db.collection('users')
      .where('preferences.dailySummary', '==', true)
      .where('preferences.emailNotifications', '==', true)
      .get();

    console.log(`📧 Found ${usersSnapshot.size} users with daily summary enabled`);

    let sentCount = 0;
    let errorCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const user = userDoc.data();
        const userId = userDoc.id;

        // Fetch pending tasks
        const assignmentsSnapshot = await db.collection('assignments')
          .where('userId', '==', userId)
          .where('status', '!=', 'completed')
          .get();

        const assignments = assignmentsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(a => new Date(a.dueDate) >= new Date());

        // Fetch incomplete habits
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

        // Only send if there are pending tasks
        if (assignments.length > 0 || habits.length > 0 || studyPlans.length > 0) {
          const result = await emailService.sendPendingTasksSummary(
            user.email,
            user.displayName,
            { assignments, habits, studyPlans }
          );

          if (result.success) {
            sentCount++;
            console.log(`✅ Sent daily summary to ${user.email}`);
          } else {
            errorCount++;
          }

          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        console.error(`Error processing user ${userDoc.id}:`, error.message);
        errorCount++;
      }
    }

    console.log(`✨ Batch daily summaries complete: ${sentCount} sent, ${errorCount} errors`);
    
    return {
      success: true,
      sent: sentCount,
      errors: errorCount,
      totalUsers: usersSnapshot.size
    };
  } catch (error) {
    console.error('Error in batch daily summaries:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

module.exports = {
  sendBatchDeadlineReminders,
  sendBatchDailySummary
};
