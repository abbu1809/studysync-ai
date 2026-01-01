const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');

/**
 * Register new user and create Firestore profile
 */
async function register(req, res, next) {
  try {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
      return res.status(400).json({
        success: false,
        message: 'UID and email are required'
      });
    }

    // Create user profile in Firestore
    const userRef = db.collection('users').doc(uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      return res.status(200).json({
        success: true,
        message: 'User already exists',
        user: userDoc.data()
      });
    }

    const userData = {
      uid,
      email,
      displayName: displayName || '',
      photoURL: photoURL || '',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      
      preferences: {
        studyHoursPerDay: 4,
        studyTimePreference: 'evening',
        breakDuration: 15,
        sessionDuration: 45,
        notificationsEnabled: true,
        theme: 'light'
      },
      
      habits: {
        averageStudyHours: 0,
        peakProductivityTime: 'evening',
        consistency: 0,
        preferredSubjects: [],
        lastAnalyzedAt: null
      },
      
      stats: {
        totalStudyTime: 0,
        assignmentsCompleted: 0,
        documentsUploaded: 0,
        chatMessages: 0
      }
    };

    await userRef.set(userData);

    res.status(201).json({
      success: true,
      message: 'User profile created successfully',
      user: userData
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Verify authentication token
 */
async function verifyToken(req, res, next) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token is required'
      });
    }

    const decodedToken = await require('../config/firebase').auth.verifyIdToken(token);

    res.status(200).json({
      success: true,
      message: 'Token is valid',
      uid: decodedToken.uid,
      email: decodedToken.email
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  verifyToken
};
