const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testGemini() {
  console.log('🧪 Testing Gemini API...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 20) + '...');
  
  try {
    // Test with gemini-2.5-flash
    console.log('\n📡 Testing gemini-2.5-flash model...');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = 'Say "Hello! Gemini API is working perfectly!" in a friendly way.';
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    console.log('✅ Success! Model Response:');
    console.log(text);
    
    // Test chat functionality
    console.log('\n📡 Testing chat functionality...');
    const chat = model.startChat({
      history: [],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    const chatResult = await chat.sendMessage('What is 2+2?');
    const chatResponse = await chatResult.response;
    console.log('✅ Chat Response:', chatResponse.text());
    
    console.log('\n✨ All tests passed! Gemini API is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Error testing Gemini API:');
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    
    if (error.message.includes('API key')) {
      console.log('\n💡 Tip: Make sure your API key is valid and has Gemini API enabled.');
      console.log('Create or check your API key at: https://aistudio.google.com/app/apikey');
    }
    
    if (error.message.includes('404')) {
      console.log('\n💡 Model not found. Available models might include:');
      console.log('   - gemini-pro');
      console.log('   - gemini-1.5-flash');
      console.log('   - gemini-1.5-pro');
    }
    
    process.exit(1);
  }
}

testGemini();
