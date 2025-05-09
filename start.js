/**
 * Start script for Sancho's Bot
 * This script helps users start the bot with proper configuration
 * 
 * To run:
 * node start.js
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=======================================================');
console.log('🤖 Sancho\'s Bot Launcher 🤖');
console.log('=======================================================');

// Check if .env file exists
const envPath = path.join(__dirname, '.env');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('⚠️ No .env file found. You need to set up the bot first.');
  rl.question('Do you want to run the setup now? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      console.log('\nRunning setup...\n');
      const setup = spawn('node', ['setup.js'], { stdio: 'inherit' });
      
      setup.on('close', (code) => {
        if (code === 0) {
          askStartMode();
        } else {
          console.log('\n❌ Setup failed. Please try again.');
          rl.close();
        }
      });
    } else {
      console.log('\n❌ Setup is required to run the bot. Exiting...');
      rl.close();
    }
  });
} else {
  askStartMode();
}

function askStartMode() {
  console.log('\nHow would you like to start Sancho\'s Bot?');
  console.log('1. Production mode (node server.js)');
  console.log('2. Development mode with auto-reload (nodemon server.js)');
  
  rl.question('Select an option (1/2): ', (answer) => {
    if (answer === '1') {
      startBot('node');
    } else if (answer === '2') {
      startBot('nodemon');
    } else {
      console.log('\n❌ Invalid option. Please select 1 or 2.');
      askStartMode();
    }
  });
}

function startBot(mode) {
  console.log(`\nStarting Sancho's Bot in ${mode === 'node' ? 'production' : 'development'} mode...\n`);
  
  const bot = spawn(mode, ['server.js'], { stdio: 'inherit' });
  
  bot.on('error', (err) => {
    if (err.code === 'ENOENT' && mode === 'nodemon') {
      console.log('❌ Nodemon is not installed. Installing it now...');
      
      const install = spawn('npm', ['install', '--save-dev', 'nodemon'], { stdio: 'inherit' });
      
      install.on('close', (code) => {
        if (code === 0) {
          console.log('\n✅ Nodemon installed successfully. Restarting in development mode...');
          startBot('npx nodemon');
        } else {
          console.log('\n❌ Failed to install Nodemon. Starting in production mode instead...');
          startBot('node');
        }
      });
    } else {
      console.error('❌ Failed to start the bot:', err);
      rl.close();
    }
  });
  
  bot.on('close', (code) => {
    console.log(`\nBot process exited with code ${code}`);
    rl.close();
  });
}

rl.on('close', () => {
  console.log('\n=======================================================');
  console.log('Thank you for using Sancho\'s Bot! 👋');
  console.log('=======================================================');
  process.exit(0);
}); 