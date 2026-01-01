const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const vivaService = require('../services/viva.service');
const { v4: uuidv4 } = require('uuid');

/**
 * Generate viva questions
 */
async function generateQuestions(req, res, next) {
  try {
    const { uid } = req.user;
    const { subject, topic, documentId, count, difficulty } = req.body;

    // Get context from documents if documentId provided
    let context = '';
    if (documentId) {
      const doc = await db.collection('documents').doc(documentId).get();
      
      if (!doc.exists || doc.data().userId !== uid) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      context = doc.data().extractedText || '';
    } else {
      // Get relevant syllabus documents
      const docs = await db.collection('documents')
        .where('userId', '==', uid)
        .where('type', '==', 'syllabus')
        .where('processingStatus', '==', 'completed')
        .get();

      context = docs.docs
        .map(doc => doc.data().extractedText)
        .join('\n\n');
    }

    // Generate questions using AI
    const questions = await vivaService.generateQuestions({
      subject,
      topic,
      context,
      count: count || 5,
      difficulty: difficulty || 'mixed'
    });

    // Save questions to Firestore
    const savedQuestions = [];
    for (const q of questions) {
      const question = {
        id: uuidv4(),
        userId: uid,
        subject,
        topic,
        documentId: documentId || null,
        question: q.question,
        answer: q.answer,
        difficulty: q.difficulty,
        attempted: false,
        userAnswer: '',
        isCorrect: null,
        attemptedAt: null,
        generatedBy: 'gemini-2.5-flash',
        createdAt: FieldValue.serverTimestamp()
      };

      await db.collection('vivaQuestions').doc(question.id).set(question);
      savedQuestions.push(question);
    }

    res.status(201).json({
      success: true,
      message: `${savedQuestions.length} questions generated successfully`,
      questions: savedQuestions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all viva questions
 */
async function getQuestions(req, res, next) {
  try {
    const { uid } = req.user;
    const { subject, topic, difficulty, attempted } = req.query;

    let query = db.collection('vivaQuestions').where('userId', '==', uid);

    if (subject) {
      query = query.where('subject', '==', subject);
    }

    if (topic) {
      query = query.where('topic', '==', topic);
    }

    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    if (attempted !== undefined) {
      query = query.where('attempted', '==', attempted === 'true');
    }

    const snapshot = await query.get();
    const questions = snapshot.docs
      .map(doc => {
        const data = doc.data();
        return {
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
          attemptedAt: data.attemptedAt?.toDate ? data.attemptedAt.toDate().toISOString() : data.attemptedAt
        };
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit answer to question
 */
async function submitAnswer(req, res, next) {
  try {
    const { uid } = req.user;
    const { questionId } = req.params;
    const { userAnswer } = req.body;

    if (!userAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Answer is required'
      });
    }

    const doc = await db.collection('vivaQuestions').doc(questionId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    const question = doc.data();

    if (question.userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Evaluate answer using AI
    const evaluation = await vivaService.evaluateAnswer({
      question: question.question,
      correctAnswer: question.answer,
      userAnswer
    });

    await db.collection('vivaQuestions').doc(questionId).update({
      attempted: true,
      userAnswer,
      isCorrect: evaluation.isCorrect,
      attemptedAt: FieldValue.serverTimestamp()
    });

    res.status(200).json({
      success: true,
      message: 'Answer submitted successfully',
      evaluation
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete question
 */
async function deleteQuestion(req, res, next) {
  try {
    const { uid } = req.user;
    const { questionId } = req.params;

    const doc = await db.collection('vivaQuestions').doc(questionId).get();

    if (!doc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    if (doc.data().userId !== uid) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    await db.collection('vivaQuestions').doc(questionId).delete();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateQuestions,
  getQuestions,
  submitAnswer,
  deleteQuestion
};
