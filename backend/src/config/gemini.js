const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get Gemini model instance
 * @param {string} modelName - Model name (default: gemini-2.5-flash)
 * @returns {object} Gemini model instance
 */
function getModel(modelName = 'gemini-2.5-flash') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate content using Gemini
 * @param {string} prompt - The prompt text
 * @param {object} options - Additional options
 * @returns {Promise<string>} Generated text
 */
async function generateContent(prompt, options = {}) {
  try {
    const model = getModel(options.model);
    
    const generationConfig = {
      temperature: options.temperature || 0.7,
      topK: options.topK || 40,
      topP: options.topP || 0.95,
      maxOutputTokens: options.maxOutputTokens || 2048,
    };

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig
    });

    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate content with Gemini: ' + error.message);
  }
}

/**
 * Start a chat session with Gemini
 * @param {Array} history - Chat history
 * @returns {object} Chat session
 */
async function startChat(history = []) {
  const model = getModel();
  
  const chat = model.startChat({
    history: history,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    }
  });

  return chat;
}

module.exports = {
  getModel,
  generateContent,
  startChat
};
