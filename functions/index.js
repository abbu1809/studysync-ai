const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * Scheduled function to check deadlines and send notifications
 * Runs daily at 9 AM
 */
exports.checkDeadlines = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    try {
      // Get assignments due within 24 hours
      const assignmentsSnapshot = await db
        .collection('assignments')
        .where('status', 'in', ['pending', 'in-progress'])
        .where('dueDate', '<=', tomorrow)
        .where('dueDate', '>=', now)
        .get();

      const notifications = [];

      for (const doc of assignmentsSnapshot.docs) {
        const assignment = doc.data();

        // Create notification
        notifications.push({
          userId: assignment.userId,
          type: 'deadline',
          title: 'Assignment Due Soon',
          message: `${assignment.title} is due tomorrow!`,
          relatedEntity: {
            type: 'assignment',
            id: assignment.id
          },
          read: false,
          readAt: null,
          actionUrl: `/assignments`,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }

      // Batch write notifications
      const batch = db.batch();
      notifications.forEach((notification) => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, notification);
      });

      await batch.commit();

      console.log(`Created ${notifications.length} deadline notifications`);
      return null;
    } catch (error) {
      console.error('Error checking deadlines:', error);
      throw error;
    }
  });

/**
 * Triggered when a new document is uploaded
 * Sends notification when processing is complete
 */
exports.onDocumentProcessed = functions.firestore
  .document('documents/{documentId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();

    // Check if processing just completed
    if (
      before.processingStatus === 'processing' &&
      after.processingStatus === 'completed'
    ) {
      const db = admin.firestore();

      // Create notification
      await db.collection('notifications').add({
        userId: after.userId,
        type: 'suggestion',
        title: 'Document Processed',
        message: `${after.title} has been processed successfully!`,
        relatedEntity: {
          type: 'document',
          id: context.params.documentId
        },
        read: false,
        readAt: null,
        actionUrl: `/documents`,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      console.log(`Document ${context.params.documentId} processed notification created`);
    }

    return null;
  });

/**
 * Scheduled function to analyze user habits
 * Runs weekly on Sunday at 8 PM
 */
exports.analyzeHabitsWeekly = functions.pubsub
  .schedule('0 20 * * 0')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();

    try {
      // Get all users
      const usersSnapshot = await db.collection('users').get();

      for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;

        // Get last 30 days of sessions
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const sessionsSnapshot = await db
          .collection('studySessions')
          .where('userId', '==', userId)
          .where('startTime', '>=', thirtyDaysAgo)
          .get();

        if (sessionsSnapshot.empty) {
          continue;
        }

        // Simple habit analysis
        const sessions = sessionsSnapshot.docs.map((doc) => doc.data());
        const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration || 0), 0);
        const uniqueDays = new Set(
          sessions.map((s) => new Date(s.startTime.toDate()).toDateString())
        ).size;

        const averageStudyHours = parseFloat((totalMinutes / 60 / uniqueDays).toFixed(2));

        // Update user habits
        await db.collection('users').doc(userId).update({
          'habits.averageStudyHours': averageStudyHours,
          'habits.lastAnalyzedAt': admin.firestore.FieldValue.serverTimestamp()
        });
      }

      console.log('Weekly habit analysis completed');
      return null;
    } catch (error) {
      console.error('Error analyzing habits:', error);
      throw error;
    }
  });

/**
 * Clean up old notifications (older than 30 days)
 */
exports.cleanupOldNotifications = functions.pubsub
  .schedule('0 2 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    const db = admin.firestore();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    try {
      const oldNotificationsSnapshot = await db
        .collection('notifications')
        .where('createdAt', '<=', thirtyDaysAgo)
        .where('read', '==', true)
        .get();

      const batch = db.batch();
      oldNotificationsSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`Deleted ${oldNotificationsSnapshot.size} old notifications`);
      return null;
    } catch (error) {
      console.error('Error cleaning up notifications:', error);
      throw error;
    }
  });
