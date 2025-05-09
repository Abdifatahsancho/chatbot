/**
 * Setup script for Sancho's Bot
 * This script will help create a .env file with required configuration
 * 
 * To run:
 * node setup.js
 */

const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=======================================================');
console.log('🤖 Welcome to Sancho\'s Bot Setup 🤖');
console.log('=======================================================');
console.log('This script will help you set up your environment variables.\n');

// Check if .env file already exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (envExists) {
  console.log('An .env file already exists. Do you want to overwrite it?');
  rl.question('Overwrite? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      promptForEnvVars();
    } else {
      console.log('\nSetup cancelled. Your existing .env file was not modified.');
      rl.close();
    }
  });
} else {
  promptForEnvVars();
}

function promptForEnvVars() {
  console.log('\nPlease enter your OpenAI API key. You can get one from https://platform.openai.com/api-keys');
  
  rl.question('OpenAI API Key: ', (apiKey) => {
    rl.question('Port number (default: 3000): ', (port) => {
      const portNumber = port || '3000';
      
      // Create or overwrite .env file
      const envContent = `PORT=${portNumber}\nOPENAI_API_KEY=${apiKey}`;
      
      try {
        fs.writeFileSync(envPath, envContent);
        console.log('\n✅ .env file created successfully!');
        console.log('\nYou can now start the bot with:');
        console.log('  npm start    (for production)');
        console.log('  npm run dev  (for development with auto-reload)');
      } catch (error) {
        console.error('\n❌ Error creating .env file:');
        console.error(error);
      }
      
      rl.close();
    });
  });
}

rl.on('close', () => {
  console.log('\n=======================================================');
  console.log('Thank you for setting up Sancho\'s Bot! 👋');
  console.log('=======================================================');
}); 