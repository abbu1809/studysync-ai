const { generateContent } = require('../config/gemini');

/**
 * Generate viva questions from content
 */
async function generateQuestions(params) {
  const { subject, topic, context, count, difficulty } = params;

  try {
    const prompt = buildVivaPrompt(subject, topic, context, count, difficulty);

    const response = await generateContent(prompt, {
      temperature: 0.7,
      maxOutputTokens: 4096
    });

    // Parse questions from response
    const questions = parseQuestions(response, difficulty);

    return questions.slice(0, count);
  } catch (error) {
    console.error('Viva generation error:', error);
    throw new Error('Failed to generate viva questions: ' + error.message);
  }
}

/**
 * Build prompt for viva generation
 */
function buildVivaPrompt(subject, topic, context, count, difficulty) {
  return `
You are an expert examiner creating viva voce (oral exam) questions for students.

Subject: ${subject}
Topic: ${topic}
Difficulty: ${difficulty}

${context ? `Context/Syllabus Content:\n${context.substring(0, 3000)}\n` : ''}

Generate ${count} high-quality viva questions with detailed answers.

Requirements:
1. Questions should test understanding, not just memorization
2. Include a mix of conceptual and application-based questions
3. Answers should be concise but complete (2-4 sentences)
4. ${difficulty === 'mixed' ? 'Include easy, medium, and hard questions' : `All questions should be ${difficulty} level`}

Return ONLY valid JSON array (no markdown):
[
  {
    "question": "Question text?",
    "answer": "Detailed answer",
    "difficulty": "easy|medium|hard"
  }
]
`;
}

/**
 * Parse questions from AI response
 */
function parseQuestions(response, difficulty) {
  try {
    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    const questions = JSON.parse(cleanResponse);

    // Validate structure
    return questions.map(q => ({
      question: q.question || '',
      answer: q.answer || '',
      difficulty: q.difficulty || (difficulty === 'mixed' ? 'medium' : difficulty)
    }));
  } catch (error) {
    console.error('Question parse error:', error);
    // Return fallback questions
    return [
      {
        question: 'Explain the key concepts of this topic.',
        answer: 'Please provide a comprehensive explanation covering the main points.',
        difficulty: 'medium'
      }
    ];
  }
}

/**
 * Evaluate user's answer
 */
async function evaluateAnswer(params) {
  const { question, correctAnswer, userAnswer } = params;

  try {
    const prompt = `
You are evaluating a student's answer to a viva question.

Question: ${question}
Expected Answer: ${correctAnswer}
Student's Answer: ${userAnswer}

Evaluate:
1. Is the answer correct? (true/false)
2. Provide brief feedback (1-2 sentences)
3. Give a score from 0-100

Return ONLY valid JSON (no markdown):
{
  "isCorrect": true,
  "score": 85,
  "feedback": "Good answer. You covered the main points..."
}
`;

    const response = await generateContent(prompt, {
      temperature: 0.3,
      maxOutputTokens: 512
    });

    let cleanResponse = response.trim();
    if (cleanResponse.startsWith('```')) {
      cleanResponse = cleanResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    }

    return JSON.parse(cleanResponse);
  } catch (error) {
    console.error('Answer evaluation error:', error);
    // Return neutral evaluation
    return {
      isCorrect: null,
      score: 50,
      feedback: 'Unable to evaluate automatically. Please review the expected answer.'
    };
  }
}

module.exports = {
  generateQuestions,
  evaluateAnswer
};
