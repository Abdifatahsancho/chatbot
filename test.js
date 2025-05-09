/**
 * Test script for Sancho's Bot OpenAI integration
 * To run: node test.js
 * 
 * Note: You need to have a valid OpenAI API key in your .env file 
 * for this test to work correctly.
 */

require('dotenv').config();
const OpenAI = require('openai');

// Check if API key is defined
if (!process.env.OPENAI_API_KEY) {
  console.error('Error: OPENAI_API_KEY is not defined in .env file');
  console.log('Please create a .env file with your OpenAI API key:');
  console.log('OPENAI_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testOpenAI() {
  console.log('Testing OpenAI integration...');
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are Sancho's bot, a helpful academic assistant."
        },
        {
          role: "user",
          content: "Hello! Can you explain what you do?"
        }
      ],
      temperature: 0.7,
      max_tokens: 200,
    });

    console.log('\n✅ OpenAI API test successful!');
    console.log('\nAI Response:');
    console.log('-----------------------------------');
    console.log(completion.choices[0].message.content);
    console.log('-----------------------------------');
    console.log('\nYour Sancho\'s Bot is correctly configured! 🚀');
    
  } catch (error) {
    console.error('\n❌ OpenAI API test failed!');
    console.error('Error details:', error.message);
    console.log('\nTroubleshooting tips:');
    console.log('1. Check that your OpenAI API key is valid');
    console.log('2. Ensure you have sufficient credits in your OpenAI account');
    console.log('3. Check your internet connection');
  }
}

testOpenAI(); 