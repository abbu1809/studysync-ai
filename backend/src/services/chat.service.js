const { generateContent, startChat } = require('../config/gemini');
const { db } = require('../config/firebase');

/**
 * Get context for chat
 */
async function getContext(userId) {
  try {
    // Get recent documents
    const docsSnapshot = await db.collection('documents')
      .where('userId', '==', userId)
      .where('processingStatus', '==', 'completed')
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();

    const documents = docsSnapshot.docs.map(doc => doc.data());

    // Get pending assignments
    const assignmentsSnapshot = await db.collection('assignments')
      .where('userId', '==', userId)
      .where('status', 'in', ['pending', 'in-progress'])
      .orderBy('dueDate', 'asc')
      .limit(10)
      .get();

    const assignments = assignmentsSnapshot.docs.map(doc => doc.data());

    // Get active study plan
    const plansSnapshot = await db.collection('studyPlans')
      .where('userId', '==', userId)
      .where('status', '==', 'active')
      .orderBy('createdAt', 'desc')
      .limit(1)
      .get();

    const studyPlan = plansSnapshot.empty ? null : plansSnapshot.docs[0].data();

    // Get user profile
    const userDoc = await db.collection('users').doc(userId).get();
    const user = userDoc.data();

    return {
      documents,
      assignments,
      studyPlan,
      user
    };
  } catch (error) {
    console.error('Error getting context:', error);
    return {
      documents: [],
      assignments: [],
      studyPlan: null,
      user: null
    };
  }
}

/**
 * Generate AI response for chat
 */
async function generateResponse(params) {
  const { message, context, conversationHistory } = params;

  try {
    const prompt = buildChatPrompt(message, context);

    // Convert conversation history to Gemini format
    const history = conversationHistory
      .slice(0, -1) // Exclude current message
      .map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }));

    // Start chat with history
    const chat = await startChat(history);
    
    // Send message
    const result = await chat.sendMessage(prompt);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error('Chat response error:', error);
    throw new Error('Failed to generate response: ' + error.message);
  }
}

/**
 * Build context-aware prompt
 */
function buildChatPrompt(message, context) {
  const { documents, assignments, studyPlan, user } = context;

  let prompt = `You are StudySync AI, an intelligent academic assistant. Help the student with their question.

CONTEXT:

Student Profile:
- Study hours per day: ${user?.preferences?.studyHoursPerDay || 'Not set'}
- Preferred study time: ${user?.preferences?.studyTimePreference || 'Not set'}
- Peak productivity: ${user?.habits?.peakProductivityTime || 'Unknown'}

`;

  // Add documents context
  if (documents && documents.length > 0) {
    prompt += `\nRecent Documents:\n`;
    documents.forEach((doc, i) => {
      prompt += `${i + 1}. ${doc.title} (${doc.type})\n`;
      if (doc.structuredData?.subjects) {
        prompt += `   Subjects: ${doc.structuredData.subjects.map(s => s.name).join(', ')}\n`;
      }
    });
  }

  // Add assignments context
  if (assignments && assignments.length > 0) {
    prompt += `\nPending Assignments:\n`;
    assignments.forEach((a, i) => {
      const dueDate = new Date(a.dueDate);
      prompt += `${i + 1}. ${a.title} - ${a.subject}\n`;
      prompt += `   Due: ${dueDate.toLocaleDateString()}\n`;
      prompt += `   Priority: ${a.priority}\n`;
    });
  }

  // Add study plan context
  if (studyPlan) {
    prompt += `\nCurrent Study Plan:\n`;
    prompt += `- Period: ${new Date(studyPlan.startDate).toLocaleDateString()} to ${new Date(studyPlan.endDate).toLocaleDateString()}\n`;
    prompt += `- Adherence: ${studyPlan.adherenceScore}%\n`;
  }

  prompt += `\nStudent Question: ${message}\n\n`;
  prompt += `Provide a helpful, concise response. If referencing specific assignments or topics, use the context above. Be encouraging and supportive.`;

  return prompt;
}

module.exports = {
  getContext,
  generateResponse
};
