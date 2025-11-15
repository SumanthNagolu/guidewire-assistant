#!/usr/bin/env node

/**
 * Real-time Browser-Based Testing for Productivity System
 * This simulates actual browser activity that you can watch in real-time
 */

const axios = require('axios');
const readline = require('readline');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const USER_ID = 'admin@intimesolutions.com';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

// Create readline interface for interactive testing
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Workflow scenarios
const WORKFLOWS = {
  recruiter: {
    name: 'Recruiter Workflow',
    steps: [
      { action: 'navigate', url: 'https://www.linkedin.com', description: 'Opening LinkedIn' },
      { action: 'wait', time: 3, description: 'Browsing LinkedIn profiles' },
      { action: 'navigate', url: 'https://www.linkedin.com/search/results/people/', description: 'Searching for React developers' },
      { action: 'wait', time: 5, description: 'Reviewing candidate profiles' },
      { action: 'navigate', url: 'https://mail.google.com', description: 'Switching to Gmail' },
      { action: 'wait', time: 3, description: 'Composing interview invitation' },
      { action: 'navigate', url: 'https://calendar.google.com', description: 'Checking calendar for interview slots' },
      { action: 'wait', time: 3, description: 'Scheduling interviews' },
      { action: 'idle', time: 10, description: 'Coffee break (idle time)' },
      { action: 'navigate', url: 'https://www.indeed.com', description: 'Posting job on Indeed' },
      { action: 'wait', time: 5, description: 'Creating job posting' }
    ]
  },
  developer: {
    name: 'Developer Workflow',
    steps: [
      { action: 'navigate', url: 'https://github.com', description: 'Opening GitHub' },
      { action: 'wait', time: 3, description: 'Reviewing pull requests' },
      { action: 'navigate', url: 'https://stackoverflow.com', description: 'Searching Stack Overflow' },
      { action: 'wait', time: 5, description: 'Reading solutions for async/await issue' },
      { action: 'navigate', url: 'http://localhost:3000', description: 'Testing local development' },
      { action: 'wait', time: 3, description: 'Testing features' },
      { action: 'navigate', url: 'https://www.npmjs.com', description: 'Searching for packages' },
      { action: 'wait', time: 3, description: 'Reading documentation' },
      { action: 'idle', time: 8, description: 'Quick break' },
      { action: 'navigate', url: 'https://docs.microsoft.com/en-us/typescript/', description: 'TypeScript documentation' },
      { action: 'wait', time: 5, description: 'Learning new TypeScript features' }
    ]
  },
  sales: {
    name: 'Sales Executive Workflow',
    steps: [
      { action: 'navigate', url: 'https://www.salesforce.com', description: 'Opening Salesforce CRM' },
      { action: 'wait', time: 5, description: 'Updating opportunity pipeline' },
      { action: 'navigate', url: 'https://mail.google.com', description: 'Checking client emails' },
      { action: 'wait', time: 3, description: 'Responding to client inquiries' },
      { action: 'navigate', url: 'https://docs.google.com', description: 'Opening proposal document' },
      { action: 'wait', time: 5, description: 'Updating pricing proposal' },
      { action: 'navigate', url: 'https://www.linkedin.com/company/', description: 'Researching client company' },
      { action: 'wait', time: 3, description: 'Gathering competitive intelligence' },
      { action: 'idle', time: 5, description: 'Short break' },
      { action: 'navigate', url: 'https://zoom.us', description: 'Joining client call' },
      { action: 'wait', time: 10, description: 'Client presentation call' }
    ]
  }
};

// Display menu
function displayMenu() {
  console.log(`\n${colors.bright}${colors.blue}🎯 REAL-TIME PRODUCTIVITY TESTING${colors.reset}`);
  console.log('=' .repeat(50));
  console.log('\nSelect a workflow to simulate:\n');
  console.log(`${colors.cyan}1.${colors.reset} Recruiter Workflow (LinkedIn → Email → Calendar)`);
  console.log(`${colors.cyan}2.${colors.reset} Developer Workflow (GitHub → Stack Overflow → Docs)`);
  console.log(`${colors.cyan}3.${colors.reset} Sales Workflow (CRM → Email → Proposals)`);
  console.log(`${colors.cyan}4.${colors.reset} Custom Manual Testing (You control browser)`);
  console.log(`${colors.cyan}5.${colors.reset} Run All Workflows Sequentially`);
  console.log(`${colors.cyan}0.${colors.reset} Exit`);
  console.log();
}

// Simulate screenshot capture
async function captureScreenshot(metadata) {
  try {
    // Create a mock screenshot with current activity
    const mockImage = Buffer.from(JSON.stringify({
      timestamp: new Date().toISOString(),
      activity: metadata.activity || 'Unknown',
      url: metadata.url || 'Desktop'
    })).toString('base64');
    
    const response = await axios.post(`${API_URL}/api/productivity/capture`, {
      image: mockImage,
      userId: USER_ID,
      timestamp: new Date().toISOString(),
      screenHash: metadata.idle ? 'idle-hash' : `hash-${Date.now()}`,
      idleDetected: metadata.idle || false,
      metadata: {
        systemTime: new Date().toISOString(),
        application: metadata.application || 'Chrome',
        windowTitle: metadata.windowTitle || metadata.activity,
        url: metadata.url
      }
    });
    
    return response.data.success;
  } catch (error) {
    console.error(`${colors.red}❌ Capture failed:${colors.reset}`, error.message);
    return false;
  }
}

// Execute workflow step
async function executeStep(step, index, total) {
  const progress = `[${index + 1}/${total}]`;
  
  switch(step.action) {
    case 'navigate':
      console.log(`${colors.green}${progress}${colors.reset} 🌐 ${step.description}`);
      console.log(`   ${colors.cyan}URL:${colors.reset} ${step.url}`);
      await captureScreenshot({
        activity: step.description,
        url: step.url,
        windowTitle: step.description
      });
      break;
      
    case 'wait':
      console.log(`${colors.yellow}${progress}${colors.reset} ⏱️  ${step.description} (${step.time}s)`);
      for (let i = 0; i < step.time; i++) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capture screenshot every 2 seconds during activity
        if (i % 2 === 0) {
          await captureScreenshot({
            activity: step.description,
            windowTitle: step.description
          });
        }
      }
      console.log(' Done');
      break;
      
    case 'idle':
      console.log(`${colors.magenta}${progress}${colors.reset} ☕ ${step.description} (${step.time}s)`);
      for (let i = 0; i < step.time; i++) {
        process.stdout.write('.');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Capture idle screenshots
        if (i % 2 === 0) {
          await captureScreenshot({
            activity: 'Idle',
            idle: true,
            windowTitle: 'Desktop'
          });
        }
      }
      console.log(' Done');
      break;
  }
}

// Run a complete workflow
async function runWorkflow(workflow) {
  console.log(`\n${colors.bright}${colors.blue}Starting: ${workflow.name}${colors.reset}`);
  console.log('=' .repeat(50));
  
  for (let i = 0; i < workflow.steps.length; i++) {
    await executeStep(workflow.steps[i], i, workflow.steps.length);
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n${colors.green}✅ Workflow completed!${colors.reset}`);
  
  // Trigger batch processing
  console.log('\n🔄 Triggering AI batch processing...');
  try {
    const response = await axios.post(`${API_URL}/api/productivity/batch-process`, {
      userId: USER_ID
    });
    
    if (response.data.success) {
      console.log(`${colors.green}✅ Batch processing complete!${colors.reset}`);
      console.log(`   Processed: ${response.data.processed} screenshots`);
      console.log(`   Time: ${response.data.processingTime}ms`);
    }
  } catch (error) {
    console.error('Batch processing error:', error.message);
  }
  
  // Show dashboard link
  console.log(`\n${colors.cyan}📊 View results in dashboard:${colors.reset}`);
  console.log(`   ${API_URL}/productivity/ai-dashboard`);
}

// Manual testing mode
async function manualTesting() {
  console.log(`\n${colors.bright}${colors.blue}MANUAL TESTING MODE${colors.reset}`);
  console.log('=' .repeat(50));
  console.log('\nInstructions:');
  console.log('1. Browse normally in your browser');
  console.log('2. Screenshots will be captured every 30 seconds');
  console.log('3. Press Enter to process batch');
  console.log('4. Type "exit" to stop\n');
  
  const captureInterval = setInterval(async () => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`📸 [${timestamp}] Screenshot captured`);
    await captureScreenshot({
      activity: 'Manual browsing',
      windowTitle: 'Browser'
    });
  }, 30000);
  
  // Initial capture
  await captureScreenshot({
    activity: 'Manual testing started',
    windowTitle: 'Browser'
  });
  
  return new Promise((resolve) => {
    rl.on('line', async (input) => {
      if (input.toLowerCase() === 'exit') {
        clearInterval(captureInterval);
        resolve();
      } else if (input === '') {
        console.log('🔄 Processing batch...');
        try {
          const response = await axios.post(`${API_URL}/api/productivity/batch-process`, {
            userId: USER_ID
          });
          console.log(`✅ Processed ${response.data.processed} screenshots`);
        } catch (error) {
          console.error('Processing error:', error.message);
        }
      }
    });
  });
}

// Main execution
async function main() {
  displayMenu();
  
  rl.question('Select option (0-5): ', async (answer) => {
    const choice = parseInt(answer);
    
    switch(choice) {
      case 1:
        await runWorkflow(WORKFLOWS.recruiter);
        break;
      case 2:
        await runWorkflow(WORKFLOWS.developer);
        break;
      case 3:
        await runWorkflow(WORKFLOWS.sales);
        break;
      case 4:
        await manualTesting();
        break;
      case 5:
        for (const key of Object.keys(WORKFLOWS)) {
          await runWorkflow(WORKFLOWS[key]);
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        break;
      case 0:
        console.log('Goodbye!');
        process.exit(0);
        break;
      default:
        console.log('Invalid option');
    }
    
    rl.close();
    console.log(`\n${colors.bright}Testing complete!${colors.reset}`);
    console.log(`View dashboard at: ${API_URL}/productivity/ai-dashboard`);
  });
}

// Check if API is running
async function checkAPI() {
  try {
    await axios.get(`${API_URL}/api/productivity/capture`);
    return true;
  } catch (error) {
    if (error.response?.status === 405) return true; // Method not allowed is OK
    return false;
  }
}

// Start
console.clear();
console.log(`${colors.bright}${colors.cyan}🚀 INTIME PRODUCTIVITY - REAL-TIME TESTING${colors.reset}`);
console.log('=' .repeat(50));

checkAPI().then(isRunning => {
  if (!isRunning) {
    console.log(`${colors.yellow}⚠️  API not running at ${API_URL}${colors.reset}`);
    console.log('Please start: npm run dev\n');
    process.exit(1);
  }
  main();
}).catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
