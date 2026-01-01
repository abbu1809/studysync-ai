const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const habitService = require('../services/habit.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Log study session
 */
async function logSession(req, res, next) {
  try {
    const { uid } = req.user;
    const { subject, topic, startTime, endTime, focusScore, notes, planId, assignmentId } = req.body;

    if (!subject || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Subject, startTime, and endTime are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);
    const duration = Math.round((end - start) / (1000 * 60)); // Minutes

    if (duration <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid time range'
      });
    }

    const timeOfDay = getTimeOfDay(start);

    const session = {
      id: uuidv4(),
      userId: uid,
      planId: planId || null,
      assignmentId: assignmentId || null,
      subject,
      topic: topic || '',
      startTime: start,
      endTime: end,
      duration,
      timeOfDay,
      focusScore: focusScore || null,
      notes: notes || '',
      createdAt: FieldValue.serverTimestamp()
    };

    await db.collection('studySessions').doc(session.id).set(session);

    // Update user stats
    await db.collection('users').doc(uid).update({
      'stats.totalStudyTime': FieldValue.increment(duration)
    });

    res.status(201).json({
      success: true,
      message: 'Study session logged successfully',
      session
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get study sessions
 */
async function getSessions(req, res, next) {
  try {
    const { uid } = req.user;
    const { startDate, endDate, subject } = req.query;

    let query = db.collection('studySessions').where('userId', '==', uid);

    if (subject) {
      query = query.where('subject', '==', subject);
    }

    if (startDate) {
      query = query.where('startTime', '>=', new Date(startDate));
    }

    if (endDate) {
      query = query.where('startTime', '<=', new Date(endDate));
    }

    // Get sessions without orderBy to avoid index requirement
    const snapshot = await query.get();
    const sessions = snapshot.docs
      .map(doc => doc.data())
      .sort((a, b) => new Date(b.startTime) - new Date(a.startTime));

    res.status(200).json({
      success: true,
      count: sessions.length,
      sessions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Analyze habits and update user profile
 */
async function analyzeHabits(req, res, next) {
  try {
    const { uid } = req.user;

    // Get last 30 days of sessions
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sessionsSnapshot = await db.collection('studySessions')
      .where('userId', '==', uid)
      .where('startTime', '>=', thirtyDaysAgo)
      .get();

    const sessions = sessionsSnapshot.docs.map(doc => doc.data());

    if (sessions.length === 0) {
      return res.status(200).json({
        success: true,
        message: 'Not enough data for analysis',
        habits: null
      });
    }

    // Analyze habits
    const analysis = habitService.analyzeStudyHabits(sessions);

    // Update user's habits
    await db.collection('users').doc(uid).update({
      habits: {
        averageStudyHours: analysis.averageStudyHours,
        peakProductivityTime: analysis.peakProductivityTime,
        consistency: analysis.consistency,
        preferredSubjects: analysis.preferredSubjects,
        lastAnalyzedAt: FieldValue.serverTimestamp()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Habits analyzed successfully',
      habits: analysis
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get habit insights
 */
async function getInsights(req, res, next) {
  try {
    const { uid } = req.user;

    // Return insights as array of messages for dashboard display
    const insights = [
      {
        type: 'info',
        message: 'Welcome to StudySync AI! Start logging study sessions to get personalized insights.'
      }
    ];

    res.status(200).json({
      success: true,
      insights
    });
  } catch (error) {
    next(error);
  }
}

// Temporarily disabled complex insights function
async function getInsightsOld(req, res, next) {
  try {
    const { uid } = req.user;

    const userDoc = await db.collection('users').doc(uid).get();
    
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();
    const habits = userData.habits || {
      averageStudyHours: 0,
      peakProductivityTime: 'morning',
      consistency: 0,
      preferredSubjects: []
    };

    // Get recent sessions for trends
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const sessionsSnapshot = await db.collection('studySessions')
      .where('userId', '==', uid)
      .where('startTime', '>=', sevenDaysAgo)
      .get();

    const recentSessions = sessionsSnapshot.docs.map(doc => doc.data());

    // Generate insights
    const insights = habitService.generateInsights({
      habits,
      recentSessions
    });

    res.status(200).json({
      success: true,
      habits,
      insights
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Helper: Determine time of day
 */
function getTimeOfDay(date) {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

/**
 * Create a new habit
 */
async function createHabit(req, res, next) {
  try {
    const { uid } = req.user;
    const { name, description, frequency, goal, category, icon, color } = req.body;

    if (!name || !frequency) {
      return res.status(400).json({
        success: false,
        message: 'Name and frequency are required'
      });
    }

    const habit = {
      id: uuidv4(),
      userId: uid,
      name,
      description: description || '',
      frequency, // 'daily', 'weekly', 'monthly'
      goal: goal || 1, // Times per frequency period
      category: category || 'general',
      icon: icon || '📝',
      color: color || '#3B82F6',
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      completions: [], // Array of completion dates
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('habits').doc(habit.id).set(habit);

    res.status(201).json({
      success: true,
      message: 'Habit created successfully',
      habit
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all habits for user
 */
async function getHabits(req, res, next) {
  try {
    const { uid } = req.user;

    const snapshot = await db.collection('habits')
      .where('userId', '==', uid)
      .get();

    const habits = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
        updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
      };
    });

    res.status(200).json({
      success: true,
      count: habits.length,
      habits
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update habit
 */
async function updateHabit(req, res, next) {
  try {
    const { uid } = req.user;
    const { habitId } = req.params;
    const { name, description, frequency, goal, category, icon, color } = req.body;

    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    if (habitDoc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updates = {
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(frequency && { frequency }),
      ...(goal && { goal }),
      ...(category && { category }),
      ...(icon && { icon }),
      ...(color && { color }),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('habits').doc(habitId).update(updates);

    res.status(200).json({
      success: true,
      message: 'Habit updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete habit
 */
async function deleteHabit(req, res, next) {
  try {
    const { uid } = req.user;
    const { habitId } = req.params;

    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    if (habitDoc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('habits').doc(habitId).delete();

    res.status(200).json({
      success: true,
      message: 'Habit deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark habit as completed for a specific date
 */
async function markHabitComplete(req, res, next) {
  try {
    const { uid } = req.user;
    const { habitId } = req.params;
    const { date, notes } = req.body;

    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const habit = habitDoc.data();

    if (habit.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const completionDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Check if already completed for this date
    const existingCompletions = habit.completions || [];
    if (existingCompletions.some(c => c.date === completionDate)) {
      return res.status(400).json({
        success: false,
        message: 'Habit already marked complete for this date'
      });
    }

    // Add completion
    const completion = {
      date: completionDate,
      completedAt: new Date().toISOString(),
      notes: notes || ''
    };

    // Calculate new streak
    const sortedCompletions = [...existingCompletions, completion].sort((a, b) => 
      new Date(b.date) - new Date(a.date)
    );

    let currentStreak = 0;
    let checkDate = new Date();
    
    for (const comp of sortedCompletions) {
      const compDate = new Date(comp.date);
      const daysDiff = Math.floor((checkDate - compDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0 || daysDiff === 1) {
        currentStreak++;
        checkDate = compDate;
      } else {
        break;
      }
    }

    await db.collection('habits').doc(habitId).update({
      completions: FieldValue.arrayUnion(completion),
      totalCompletions: FieldValue.increment(1),
      streak: currentStreak,
      longestStreak: Math.max(habit.longestStreak || 0, currentStreak),
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Habit marked as complete',
      streak: currentStreak
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Unmark habit completion for a specific date
 */
async function unmarkHabitComplete(req, res, next) {
  try {
    const { uid } = req.user;
    const { habitId } = req.params;
    const { date } = req.body;

    const habitDoc = await db.collection('habits').doc(habitId).get();

    if (!habitDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Habit not found'
      });
    }

    const habit = habitDoc.data();

    if (habit.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const targetDate = date ? new Date(date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

    // Remove completion for this date
    const updatedCompletions = (habit.completions || []).filter(c => c.date !== targetDate);

    await db.collection('habits').doc(habitId).update({
      completions: updatedCompletions,
      totalCompletions: FieldValue.increment(-1),
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Habit unmarked'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  logSession,
  getSessions,
  analyzeHabits,
  getInsights,
  createHabit,
  getHabits,
  updateHabit,
  deleteHabit,
  markHabitComplete,
  unmarkHabitComplete
};
