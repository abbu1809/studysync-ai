const axios = require('axios');
require('dotenv').config();

async function checkApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  
  console.log('🔍 Checking Gemini API Key...\n');
  console.log('API Key:', apiKey?.substring(0, 20) + '...\n');
  
  try {
    // Try to list available models
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    console.log('📡 Fetching available models...\n');
    
    const response = await axios.get(url);
    
    console.log('✅ API Key is valid!\n');
    console.log('Available Models:');
    console.log('=================');
    
    if (response.data.models) {
      response.data.models.forEach(model => {
        console.log(`\n📦 ${model.name}`);
        console.log(`   Display Name: ${model.displayName}`);
        console.log(`   Description: ${model.description || 'N/A'}`);
        if (model.supportedGenerationMethods) {
          console.log(`   Supported Methods: ${model.supportedGenerationMethods.join(', ')}`);
        }
      });
      
      // Find the best model to use
      const workingModels = response.data.models.filter(m => 
        m.supportedGenerationMethods?.includes('generateContent')
      );
      
      if (workingModels.length > 0) {
        const recommendedModel = workingModels[0].name.replace('models/', '');
        console.log(`\n\n✨ Recommended model to use: ${recommendedModel}`);
      }
      
    } else {
      console.log('No models found.');
    }
    
  } catch (error) {
    console.error('\n❌ Error checking API key:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 400) {
      console.log('\n💡 API key might be invalid. Please:');
      console.log('1. Go to https://aistudio.google.com/app/apikey');
      console.log('2. Delete the old key and create a NEW one');
      console.log('3. Make sure to copy the COMPLETE key');
    } else if (error.response?.status === 403) {
      console.log('\n💡 API key has no permissions. Please:');
      console.log('1. Go to https://aistudio.google.com/app/apikey');
      console.log('2. Create a new API key');
      console.log('3. Ensure Generative Language API is enabled');
    }
  }
}

checkApiKey();
