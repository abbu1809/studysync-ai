const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const studyPlanService = require('../services/studyPlan.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate new study plan
 */
async function generatePlan(req, res, next) {
  try {
    const { uid } = req.user;
    const { startDate, endDate, includeAssignments, excludeDays } = req.body;

    // Get user data
    const userDoc = await db.collection('users').doc(uid).get();
    if (!userDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const userData = userDoc.data();

    // Get assignments to include
    let assignments = [];
    if (includeAssignments && includeAssignments.length > 0) {
      const assignmentDocs = await db.collection('assignments')
        .where('userId', '==', uid)
        .where('status', 'in', ['pending', 'in-progress'])
        .get();
      
      assignments = assignmentDocs.docs
        .map(doc => doc.data())
        .filter(a => includeAssignments.includes(a.id));
    } else {
      // Include all pending assignments
      const assignmentDocs = await db.collection('assignments')
        .where('userId', '==', uid)
        .where('status', 'in', ['pending', 'in-progress'])
        .get();
      
      assignments = assignmentDocs.docs.map(doc => doc.data());
    }

    // Get syllabus documents
    const syllabusDocsSnapshot = await db.collection('documents')
      .where('userId', '==', uid)
      .where('type', '==', 'syllabus')
      .where('processingStatus', '==', 'completed')
      .get();

    const syllabusData = syllabusDocsSnapshot.docs.map(doc => doc.data().structuredData);

    // Generate study plan using AI
    const schedule = await studyPlanService.generateSchedule({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      userPreferences: userData.preferences,
      userHabits: userData.habits,
      assignments,
      syllabusData,
      excludeDays: excludeDays || []
    });

    // Create study plan document
    const studyPlan = {
      id: uuidv4(),
      userId: uid,
      planType: 'custom',
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      schedule,
      generationPrompt: '', // Will be set by service
      aiModel: 'gemini-2.5-flash',
      status: 'active',
      adherenceScore: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    };

    await db.collection('studyPlans').doc(studyPlan.id).set(studyPlan);

    res.status(201).json({
      success: true,
      message: 'Study plan generated successfully',
      plan: studyPlan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all study plans
 */
async function getPlans(req, res, next) {
  try {
    const { uid } = req.user;
    const { status } = req.query;

    let query = db.collection('studyPlans').where('userId', '==', uid);

    if (status) {
      query = query.where('status', '==', status);
    }

    const snapshot = await query.get();
    const plans = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          startDate: data.startDate?.toDate ? data.startDate.toDate().toISOString() : data.startDate,
          endDate: data.endDate?.toDate ? data.endDate.toDate().toISOString() : data.endDate,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: plans.length,
      plans
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get specific study plan
 */
async function getPlan(req, res, next) {
  try {
    const { uid } = req.user;
    const { planId } = req.params;

    const doc = await db.collection('studyPlans').doc(planId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    const plan = doc.data();

    if (plan.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.status(200).json({
      success: true,
      plan
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update session completion status
 */
async function updateSession(req, res, next) {
  try {
    const { uid } = req.user;
    const { planId, sessionId } = req.params;
    const { completed, notes } = req.body;

    const doc = await db.collection('studyPlans').doc(planId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    const plan = doc.data();

    if (plan.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update session in schedule
    const updatedSchedule = plan.schedule.map(day => ({
      ...day,
      sessions: day.sessions.map(session => {
        if (session.id === sessionId) {
          return {
            ...session,
            completed: completed !== undefined ? completed : session.completed,
            completedAt: completed ? new Date() : session.completedAt,
            notes: notes || session.notes
          };
        }
        return session;
      })
    }));

    // Calculate adherence score
    const totalSessions = updatedSchedule.reduce((sum, day) => sum + day.sessions.length, 0);
    const completedSessions = updatedSchedule.reduce(
      (sum, day) => sum + day.sessions.filter(s => s.completed).length,
      0
    );
    const adherenceScore = Math.round((completedSessions / totalSessions) * 100);

    await db.collection('studyPlans').doc(planId).update({
      schedule: updatedSchedule,
      adherenceScore,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Session updated successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Rebalance study plan
 */
async function rebalancePlan(req, res, next) {
  try {
    const { uid } = req.user;
    const { planId } = req.params;

    const doc = await db.collection('studyPlans').doc(planId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    const plan = doc.data();

    if (plan.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user data for rebalancing
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();

    // Get pending assignments
    const assignmentDocs = await db.collection('assignments')
      .where('userId', '==', uid)
      .where('status', 'in', ['pending', 'in-progress'])
      .get();
    const assignments = assignmentDocs.docs.map(doc => doc.data());

    // Regenerate schedule
    const newSchedule = await studyPlanService.rebalanceSchedule({
      currentPlan: plan,
      userPreferences: userData.preferences,
      assignments
    });

    await db.collection('studyPlans').doc(planId).update({
      schedule: newSchedule,
      updatedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Study plan rebalanced successfully'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete study plan
 */
async function deletePlan(req, res, next) {
  try {
    const { uid } = req.user;
    const { planId } = req.params;

    const doc = await db.collection('studyPlans').doc(planId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Study plan not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('studyPlans').doc(planId).delete();

    res.status(200).json({
      success: true,
      message: 'Study plan deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generatePlan,
  getPlans,
  getPlan,
  updateSession,
  rebalancePlan,
  deletePlan
};
