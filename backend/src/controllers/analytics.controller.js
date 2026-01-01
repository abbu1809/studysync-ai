const { db } = require('../config/firebase');
const { FieldValue } = require('firebase-admin/firestore');
const { v4: uuidv4 } = require('uuid');
const { generateContent } = require('../config/gemini');

/**
 * Generate viva questions (including MCQs)
 */
async function generateVivaQuestions(req, res, next) {
  try {
    const { uid } = req.user;
    console.log('🔍 Received request body:', JSON.stringify(req.body, null, 2));
    const { topic, documentId, count = 5, includeMCQ = false } = req.body;

    if (!topic) {
      console.log('❌ Topic is missing from request body');
      return res.status(400).json({
        success: false,
        message: 'Topic is required'
      });
    }
    console.log('✅ Topic found:', topic);

    const questionType = includeMCQ ? 'viva questions and multiple-choice questions (MCQs)' : 'viva questions';
    
    const prompt = `Generate ${count} ${questionType} on the topic: "${topic}".

${includeMCQ ? `For each question, provide:
1. Question text
2. Type: "viva" or "mcq"
3. For MCQ: 4 options (A, B, C, D) and the correct answer
4. Difficulty level: easy/medium/hard
5. Expected answer/explanation

Format as JSON array with this structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "question text",
      "type": "viva" or "mcq",
      "options": ["A. option1", "B. option2", "C. option3", "D. option4"] (for MCQ only),
      "correctAnswer": "A" (for MCQ only),
      "explanation": "detailed explanation",
      "difficulty": "easy/medium/hard",
      "topic": "${topic}"
    }
  ]
}` : `For each question, provide the question text and difficulty level.

Format as JSON with structure:
{
  "questions": [
    {
      "id": "unique_id",
      "question": "question text",
      "type": "viva",
      "difficulty": "easy/medium/hard",
      "topic": "${topic}"
    }
  ]
}`}`;

    const response = await generateContent(prompt, { 
      temperature: 0.7,
      maxOutputTokens: 8192  // Increased from default 2048 to handle longer responses
    });
    
    console.log('🤖 Raw AI response length:', response.length);
    
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonText = response;
    
    // Remove markdown code blocks if present
    jsonText = jsonText.replace(/```json\s*/g, '').replace(/```\s*/g, '');
    
    // Trim whitespace
    jsonText = jsonText.trim();
    
    console.log('📝 After cleanup, text length:', jsonText.length);
    
    let data;
    try {
      data = JSON.parse(jsonText);
      console.log('✅ Successfully parsed JSON, questions count:', data.questions?.length);
    } catch (parseError) {
      console.log('❌ JSON parse error:', parseError.message);
      console.log('First 1000 chars of text:', jsonText.substring(0, 1000));
      throw new Error('Failed to parse AI response - invalid JSON format: ' + parseError.message);
    }
    
    // Add unique IDs to questions if not present
    data.questions = data.questions.map(q => ({
      ...q,
      id: q.id || uuidv4()
    }));

    // Store question session
    const session = {
      id: uuidv4(),
      userId: uid,
      documentId: documentId || null,
      topic,
      questions: data.questions,
      includeMCQ,
      createdAt: FieldValue.serverTimestamp()
    };

    await db.collection('vivaQuestions').doc(session.id).set(session);

    res.json({
      success: true,
      sessionId: session.id,
      questions: data.questions
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Submit viva/MCQ answers and calculate score
 */
async function submitVivaAnswers(req, res, next) {
  try {
    const { uid } = req.user;
    const { sessionId, answers } = req.body;

    if (!sessionId || !answers) {
      return res.status(400).json({
        success: false,
        message: 'Session ID and answers are required'
      });
    }

    // Get the question session
    const sessionDoc = await db.collection('vivaQuestions').doc(sessionId).get();
    
    if (!sessionDoc.exists) {
      return res.status(404).json({
        success: false,
        message: 'Question session not found'
      });
    }

    const sessionData = sessionDoc.data();
    const questions = sessionData.questions;

    // Calculate score (for MCQs)
    let correctAnswers = 0;
    let totalMCQs = 0;
    const results = [];

    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        const result = {
          questionId: answer.questionId,
          question: question.question,
          type: question.type,
          userAnswer: answer.answer,
          difficulty: question.difficulty
        };

        if (question.type === 'mcq') {
          totalMCQs++;
          const isCorrect = answer.answer === question.correctAnswer;
          if (isCorrect) correctAnswers++;
          
          result.correctAnswer = question.correctAnswer;
          result.isCorrect = isCorrect;
          result.explanation = question.explanation;
        }

        results.push(result);
      }
    });

    const score = totalMCQs > 0 ? Math.round((correctAnswers / totalMCQs) * 100) : null;

    // Store result
    const vivaResult = {
      id: uuidv4(),
      userId: uid,
      sessionId,
      topic: sessionData.topic,
      documentId: sessionData.documentId,
      answers: results,
      score,
      totalQuestions: answers.length,
      totalMCQs,
      correctAnswers,
      completedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp()
    };

    await db.collection('vivaResults').doc(vivaResult.id).set(vivaResult);

    // Update user stats
    await db.collection('users').doc(uid).update({
      'stats.vivasCompleted': FieldValue.increment(1)
    });

    res.json({
      success: true,
      resultId: vivaResult.id,
      score,
      correctAnswers,
      totalMCQs,
      results
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get viva results history
 */
async function getVivaResults(req, res, next) {
  try {
    const { uid } = req.user;
    const { limit = 20, topic } = req.query;

    let query = db.collection('vivaResults')
      .where('userId', '==', uid)
      .orderBy('completedAt', 'desc')
      .limit(parseInt(limit));

    if (topic) {
      query = query.where('topic', '==', topic);
    }

    const snapshot = await query.get();

    const results = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        completedAt: data.completedAt?.toDate ? data.completedAt.toDate().toISOString() : data.completedAt,
        createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt
      };
    });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get analytics data for dashboard
 */
async function getAnalytics(req, res, next) {
  try {
    const { uid } = req.user;
    const { period = 'month' } = req.query; // week, month, year

    const now = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get study sessions
    const sessionsSnapshot = await db.collection('studySessions')
      .where('userId', '==', uid)
      .where('startTime', '>=', startDate)
      .get();

    // Get assignments
    const assignmentsSnapshot = await db.collection('assignments')
      .where('userId', '==', uid)
      .get();

    // Get viva results
    const vivaSnapshot = await db.collection('vivaResults')
      .where('userId', '==', uid)
      .where('completedAt', '>=', startDate)
      .get();

    // Get habits
    const habitsSnapshot = await db.collection('habits')
      .where('userId', '==', uid)
      .get();

    // Process study sessions data
    const sessionsByDay = {};
    const sessionsBySubject = {};
    const sessionsByTime = { morning: 0, afternoon: 0, evening: 0, night: 0 };
    let totalStudyMinutes = 0;

    sessionsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const date = data.startTime.toDate().toISOString().split('T')[0];
      
      sessionsByDay[date] = (sessionsByDay[date] || 0) + data.duration;
      sessionsBySubject[data.subject] = (sessionsBySubject[data.subject] || 0) + data.duration;
      sessionsByTime[data.timeOfDay] = (sessionsByTime[data.timeOfDay] || 0) + 1;
      totalStudyMinutes += data.duration;
    });

    // Process assignments
    const assignmentsByStatus = { pending: 0, 'in-progress': 0, completed: 0 };
    const assignmentsByDifficulty = { easy: 0, medium: 0, hard: 0 };
    
    assignmentsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      const status = typeof data.status === 'string' ? data.status : data.status?.status || 'pending';
      assignmentsByStatus[status] = (assignmentsByStatus[status] || 0) + 1;
      assignmentsByDifficulty[data.difficulty] = (assignmentsByDifficulty[data.difficulty] || 0) + 1;
    });

    // Process viva results
    const vivaScores = [];
    const vivaByTopic = {};
    
    vivaSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.score !== null) {
        vivaScores.push({
          date: data.completedAt.toDate().toISOString().split('T')[0],
          score: data.score,
          topic: data.topic
        });
        
        if (!vivaByTopic[data.topic]) {
          vivaByTopic[data.topic] = { total: 0, count: 0 };
        }
        vivaByTopic[data.topic].total += data.score;
        vivaByTopic[data.topic].count += 1;
      }
    });

    // Process habits
    const habitCompletionRate = {};
    let totalHabitCompletions = 0;
    
    habitsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      habitCompletionRate[data.name] = {
        total: data.totalCompletions || 0,
        streak: data.streak || 0
      };
      totalHabitCompletions += data.totalCompletions || 0;
    });

    // Prepare daily study time chart data
    const dailyStudyData = Object.entries(sessionsByDay)
      .map(([date, minutes]) => ({
        date,
        minutes,
        hours: Math.round((minutes / 60) * 10) / 10
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Prepare subject distribution
    const subjectData = Object.entries(sessionsBySubject)
      .map(([subject, minutes]) => ({
        subject,
        minutes,
        percentage: Math.round((minutes / totalStudyMinutes) * 100)
      }))
      .sort((a, b) => b.minutes - a.minutes);

    // Calculate averages
    const avgVivaScore = vivaScores.length > 0
      ? Math.round(vivaScores.reduce((sum, v) => sum + v.score, 0) / vivaScores.length)
      : 0;

    const avgStudyHoursPerDay = dailyStudyData.length > 0
      ? Math.round((totalStudyMinutes / dailyStudyData.length / 60) * 10) / 10
      : 0;

    res.json({
      success: true,
      period,
      analytics: {
        studyTime: {
          total: totalStudyMinutes,
          totalHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
          average: avgStudyHoursPerDay,
          byDay: dailyStudyData,
          bySubject: subjectData,
          byTimeOfDay: sessionsByTime
        },
        assignments: {
          byStatus: assignmentsByStatus,
          byDifficulty: assignmentsByDifficulty,
          total: assignmentsSnapshot.size,
          completionRate: assignmentsSnapshot.size > 0
            ? Math.round((assignmentsByStatus.completed / assignmentsSnapshot.size) * 100)
            : 0
        },
        viva: {
          averageScore: avgVivaScore,
          scores: vivaScores,
          byTopic: Object.entries(vivaByTopic).map(([topic, data]) => ({
            topic,
            avgScore: Math.round(data.total / data.count),
            attempts: data.count
          })),
          total: vivaSnapshot.size
        },
        habits: {
          totalCompletions: totalHabitCompletions,
          byHabit: habitCompletionRate,
          total: habitsSnapshot.size
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  generateVivaQuestions,
  submitVivaAnswers,
  getVivaResults,
  getAnalytics
};
