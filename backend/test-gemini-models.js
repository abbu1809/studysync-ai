const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testModels() {
  console.log('🧪 Testing different Gemini models...\n');
  console.log('API Key:', process.env.GEMINI_API_KEY?.substring(0, 20) + '...\n');
  
  const modelsToTest = [
    'gemini-pro',
    'gemini-1.5-flash',
    'gemini-1.5-pro',
    'gemini-1.5-flash-latest',
    'gemini-1.5-pro-latest'
  ];
  
  for (const modelName of modelsToTest) {
    try {
      console.log(`📡 Testing ${modelName}...`);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const result = await model.generateContent('Say "works!" in one word');
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ ${modelName} WORKS! Response: ${text.trim()}\n`);
      
      // If successful, update the config and exit
      console.log(`\n🎉 Success! Use this model: ${modelName}`);
      return modelName;
      
    } catch (error) {
      console.log(`❌ ${modelName} failed: ${error.message.split('\n')[0]}\n`);
    }
  }
  
  console.log('\n❌ None of the models worked. Please check:');
  console.log('1. Go to https://aistudio.google.com/app/apikey');
  console.log('2. Make sure you created the API key');
  console.log('3. Try creating a NEW API key');
  console.log('4. Check if Gemini API is available in your region');
}

testModels();
