const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Get user profile
 */
async function getProfile(req, res, next) {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();

    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found'
      });
    }

    res.status(200).json({
      success: true,
      user: userDoc.data()
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user profile
 */
async function updateProfile(req, res, next) {
  try {
    const { uid } = req.user;
    const { displayName, photoURL } = req.body;

    const updateData = {
      updatedAt: FieldValue.serverTimestamp()
    };

    if (displayName !== undefined) updateData.displayName = displayName;
    if (photoURL !== undefined) updateData.photoURL = photoURL;

    await db.collection('users').doc(uid).update(updateData);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update user preferences
 */
async function updatePreferences(req, res, next) {
  try {
    const { uid } = req.user;
    const preferences = req.body;

    await db.collection('users').doc(uid).update({
      preferences: preferences,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get user statistics
 */
async function getStats(req, res, next) {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate actual stats from collections
    const [documentsSnapshot, assignmentsSnapshot, sessionsSnapshot, chatSnapshot] = await Promise.all([
      db.collection('documents').where('userId', '==', uid).get(),
      db.collection('assignments').where('userId', '==', uid).where('status', '==', 'completed').get(),
      db.collection('studySessions').where('userId', '==', uid).get(),
      db.collection('chatHistory').where('userId', '==', uid).get()
    ]);

    // Calculate total study time from sessions (in minutes)
    let totalStudyTime = 0;
    sessionsSnapshot.forEach(doc => {
      const session = doc.data();
      if (session.duration) {
        totalStudyTime += session.duration;
      }
    });

    // Count chat messages
    let chatMessages = 0;
    chatSnapshot.forEach(doc => {
      const chat = doc.data();
      if (chat.messages && Array.isArray(chat.messages)) {
        chatMessages += chat.messages.length;
      }
    });

    const stats = {
      documentsUploaded: documentsSnapshot.size,
      assignmentsCompleted: assignmentsSnapshot.size,
      totalStudyTime: totalStudyTime, // in minutes
      chatMessages: chatMessages
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete user account
 */
async function deleteAccount(req, res, next) {
  try {
    const { uid } = req.user;

    // Delete all user data from Firestore collections
    const batch = db.batch();

    // Delete documents
    const docs = await db.collection('documents').where('userId', '==', uid).get();
    docs.forEach(doc => batch.delete(doc.ref));

    // Delete assignments
    const assignments = await db.collection('assignments').where('userId', '==', uid).get();
    assignments.forEach(doc => batch.delete(doc.ref));

    // Delete study plans
    const plans = await db.collection('studyPlans').where('userId', '==', uid).get();
    plans.forEach(doc => batch.delete(doc.ref));

    // Delete study sessions
    const sessions = await db.collection('studySessions').where('userId', '==', uid).get();
    sessions.forEach(doc => batch.delete(doc.ref));

    // Delete viva questions
    const questions = await db.collection('vivaQuestions').where('userId', '==', uid).get();
    questions.forEach(doc => batch.delete(doc.ref));

    // Delete chat history
    const chats = await db.collection('chatHistory').where('userId', '==', uid).get();
    chats.forEach(doc => batch.delete(doc.ref));

    // Delete user profile
    batch.delete(db.collection('users').doc(uid));

    await batch.commit();

    // Delete from Firebase Auth
    await require('../config/firebase').auth.deleteUser(uid);

    res.status(200).json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProfile,
  updateProfile,
  updatePreferences,
  getStats,
  deleteAccount
};
