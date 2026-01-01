const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const resourceService = require('../services/resource.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Get recommended resources for a topic
 */
async function getRecommendations(req, res, next) {
  try {
    const { uid } = req.user;
    const { subject, topic } = req.query;

    if (!subject || !topic) {
      return res.status(400).json({
        success: false,
        message: 'Subject and topic are required'
      });
    }

    // Check if we already have resources for this topic
    const existingResources = await db.collection('resources')
      .where('userId', '==', uid)
      .where('subject', '==', subject)
      .where('topic', '==', topic)
      .get();

    if (!existingResources.empty) {
      const resources = existingResources.docs.map(doc => doc.data());
      return res.status(200).json({
        success: true,
        count: resources.length,
        resources,
        source: 'cache'
      });
    }

    // Generate new recommendations
    const recommendations = await resourceService.generateRecommendations({
      subject,
      topic,
      userId: uid
    });

    // Save recommendations to Firestore
    const savedResources = [];
    for (const rec of recommendations) {
      const resource = {
        id: uuidv4(),
        userId: uid,
        subject,
        topic,
        title: rec.title,
        url: rec.url,
        type: rec.type,
        source: rec.source,
        relevanceScore: rec.relevanceScore,
        viewed: false,
        viewedAt: null,
        helpful: null,
        recommendedBy: 'ai',
        createdAt: FieldValue.serverTimestamp()
      };

      await db.collection('resources').doc(resource.id).set(resource);
      savedResources.push(resource);
    }

    res.status(200).json({
      success: true,
      count: savedResources.length,
      resources: savedResources,
      source: 'generated'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Mark resource as viewed
 */
async function markAsViewed(req, res, next) {
  try {
    const { uid } = req.user;
    const { resourceId } = req.params;

    const doc = await db.collection('resources').doc(resourceId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('resources').doc(resourceId).update({
      viewed: true,
      viewedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Resource marked as viewed'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit feedback on resource
 */
async function submitFeedback(req, res, next) {
  try {
    const { uid } = req.user;
    const { resourceId } = req.params;
    const { helpful } = req.body;

    if (helpful === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Feedback (helpful: true/false) is required'
      });
    }

    const doc = await db.collection('resources').doc(resourceId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('resources').doc(resourceId).update({
      helpful
    });

    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRecommendations,
  markAsViewed,
  submitFeedback
};
