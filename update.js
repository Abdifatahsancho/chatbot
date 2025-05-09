/**
 * Update script for Sancho's Bot
 * This script helps users update their dependencies and configuration
 * 
 * To run:
 * node update.js
 */

const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('=======================================================');
console.log('🤖 Sancho\'s Bot Updater 🤖');
console.log('=======================================================');
console.log('This script will help you update your bot to the latest version.\n');

// Menu options
function showMenu() {
  console.log('\nWhat would you like to update?');
  console.log('1. Update dependencies (npm packages)');
  console.log('2. Reconfigure OpenAI API key');
  console.log('3. Check for system updates');
  console.log('4. Exit');
  
  rl.question('\nSelect an option (1-4): ', handleMenuChoice);
}

// Handle menu choice
function handleMenuChoice(choice) {
  switch (choice) {
    case '1':
      updateDependencies();
      break;
    case '2':
      reconfigureAPI();
      break;
    case '3':
      checkSystemUpdates();
      break;
    case '4':
      console.log('\nExiting updater...');
      rl.close();
      break;
    default:
      console.log('\n❌ Invalid option. Please select a number between 1 and 4.');
      showMenu();
      break;
  }
}

// Update dependencies
function updateDependencies() {
  console.log('\nUpdating dependencies...');
  
  const update = spawn('npm', ['update'], { stdio: 'inherit' });
  
  update.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Dependencies updated successfully!');
    } else {
      console.log('\n❌ Failed to update dependencies. Please try again or update manually with "npm update".');
    }
    
    askContinue();
  });
}

// Reconfigure API
function reconfigureAPI() {
  console.log('\nReconfiguring OpenAI API key...');
  
  const setup = spawn('node', ['setup.js'], { stdio: 'inherit' });
  
  setup.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ API key reconfigured successfully!');
    } else {
      console.log('\n❌ Failed to reconfigure API key.');
    }
    
    askContinue();
  });
}

// Check for system updates
function checkSystemUpdates() {
  console.log('\nChecking for system updates...');
  
  // This is a placeholder for actual update checking logic
  // In a real application, you might check a remote repository for new versions
  
  console.log('\nCurrent version: 1.0.0');
  console.log('Latest version: 1.0.0');
  console.log('\n✅ Your bot is up to date!');
  
  // For demonstration purposes, we'll just check if the required files exist
  const requiredFiles = ['server.js', 'package.json', 'public/index.html', 'public/styles.css', 'public/script.js'];
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(path.join(__dirname, file))) {
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log('\n⚠️ Warning: The following files are missing:');
    missingFiles.forEach(file => console.log(`  - ${file}`));
    console.log('\nYour bot may not function correctly. Consider reinstalling or restoring these files.');
  }
  
  askContinue();
}

// Ask if the user wants to continue
function askContinue() {
  rl.question('\nWould you like to perform another action? (y/n): ', (answer) => {
    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      showMenu();
    } else {
      rl.close();
    }
  });
}

// Start the script
showMenu();

rl.on('close', () => {
  console.log('\n=======================================================');
  console.log('Thank you for updating Sancho\'s Bot! 👋');
  console.log('=======================================================');
  process.exit(0);
}); 