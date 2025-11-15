#!/usr/bin/env node

/**
 * End-to-End Test Scenarios for Unified Productivity System
 * Tests different role scenarios: Recruiter, Developer, Sales
 */

const axios = require('axios');
const crypto = require('crypto');

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Test scenarios for different roles
const ROLE_SCENARIOS = {
  recruiter: {
    userId: 'recruiter@intimesolutions.com',
    role: 'recruiter',
    screenshots: [
      { app: 'LinkedIn', window: 'LinkedIn - Search People', idle: false },
      { app: 'LinkedIn', window: 'John Doe - Software Engineer', idle: false },
      { app: 'LinkedIn', window: 'Jane Smith - Senior Developer', idle: false },
      { app: 'Outlook', window: 'Compose - Interview Invitation', idle: false },
      { app: 'Desktop', window: '', idle: true }, // 5 min break
      { app: 'Indeed', window: 'Post a Job - Senior React Developer', idle: false },
      { app: 'Excel', window: 'Candidate Tracker 2024.xlsx', idle: false },
      { app: 'Teams', window: 'Recruitment Team Chat', idle: false },
      { app: 'LinkedIn', window: 'Messages - 5 new responses', idle: false },
      { app: 'Calendar', window: 'Schedule Interview - Mike Johnson', idle: false }
    ],
    expectedSummary: {
      '15min': /reviewed.*profiles|LinkedIn|candidates|screening/i,
      '30min': /recruitment|sourcing|interview|candidates/i,
      '1hr': /recruited|interviewed|scheduled|candidates/i
    }
  },
  
  developer: {
    userId: 'developer@intimesolutions.com',
    role: 'active_consultant',
    screenshots: [
      { app: 'VS Code', window: 'payment-service.ts', idle: false },
      { app: 'VS Code', window: 'payment-service.test.ts', idle: false },
      { app: 'Terminal', window: 'npm test', idle: false },
      { app: 'Chrome', window: 'Stack Overflow - TypeScript async/await', idle: false },
      { app: 'VS Code', window: 'payment-service.ts', idle: false },
      { app: 'GitHub', window: 'Pull Request #234 - Payment Integration', idle: false },
      { app: 'Desktop', window: '', idle: true }, // Coffee break
      { app: 'Teams', window: 'Daily Standup Meeting', idle: false },
      { app: 'Postman', window: 'Payment API Testing', idle: false },
      { app: 'VS Code', window: 'README.md - Documentation', idle: false }
    ],
    expectedSummary: {
      '15min': /coding|development|VS Code|payment|testing/i,
      '30min': /implemented|tested|debugged|feature/i,
      '1hr': /development|programming|code|API/i
    }
  },
  
  sales_executive: {
    userId: 'sales@intimesolutions.com',
    role: 'sales_executive',
    screenshots: [
      { app: 'Salesforce', window: 'Opportunity - ABC Corp - $50k', idle: false },
      { app: 'Outlook', window: 'RE: Proposal Discussion - ABC Corp', idle: false },
      { app: 'PowerPoint', window: 'ABC Corp Proposal Q4 2024.pptx', idle: false },
      { app: 'Excel', window: 'Pricing Calculator - ABC Corp', idle: false },
      { app: 'Teams', window: 'Call with John from ABC Corp', idle: false },
      { app: 'Desktop', window: '', idle: true }, // Short break
      { app: 'LinkedIn', window: 'ABC Corp - Company Page', idle: false },
      { app: 'Salesforce', window: 'Update Opportunity Stage - Negotiation', idle: false },
      { app: 'Outlook', window: 'Compose - Follow-up ABC Corp', idle: false },
      { app: 'Chrome', window: 'Competitor Analysis - TechCorp', idle: false }
    ],
    expectedSummary: {
      '15min': /sales|proposal|client|Salesforce|opportunity/i,
      '30min': /client communication|proposal|negotiation|CRM/i,
      '1hr': /sales activities|pipeline|opportunity|proposal/i
    }
  }
};

// Simulate screenshot capture for a role
async function simulateScreenshots(scenario) {
  console.log(`\n📸 Simulating ${scenario.screenshots.length} screenshots for ${scenario.role}...`);
  
  const results = [];
  for (let i = 0; i < scenario.screenshots.length; i++) {
    const screenshot = scenario.screenshots[i];
    
    // Generate unique hash for non-idle screenshots
    const hash = screenshot.idle 
      ? (i > 0 ? results[i-1].hash : crypto.randomBytes(16).toString('hex'))
      : crypto.randomBytes(16).toString('hex');
    
    try {
      // Create minimal base64 image
      const mockImage = Buffer.from(`test-${Date.now()}`).toString('base64');
      
      const response = await axios.post(`${API_URL}/api/productivity/capture`, {
        image: mockImage,
        userId: scenario.userId,
        timestamp: new Date(Date.now() - (scenario.screenshots.length - i) * 30000).toISOString(),
        screenHash: hash,
        idleDetected: screenshot.idle,
        metadata: {
          systemTime: new Date().toISOString(),
          application: screenshot.app,
          windowTitle: screenshot.window
        }
      });
      
      results.push({
        success: response.data.success,
        hash,
        app: screenshot.app
      });
      
      process.stdout.write(screenshot.idle ? '😴' : '✅');
      
      // Small delay between captures
      await new Promise(resolve => setTimeout(resolve, 100));
      
    } catch (error) {
      process.stdout.write('❌');
      results.push({ success: false, error: error.message });
    }
  }
  
  console.log('\n✅ Screenshots simulated');
  return results;
}

// Trigger batch processing
async function triggerBatchProcessing(userId) {
  console.log('\n🔄 Triggering batch processing...');
  
  try {
    const response = await axios.post(`${API_URL}/api/productivity/batch-process`, {
      userId
    });
    
    if (response.data.success) {
      console.log('✅ Batch processing completed');
      console.log(`   - Processed: ${response.data.processed} screenshots`);
      console.log(`   - Windows: ${response.data.contextWindows?.join(', ') || 'N/A'}`);
      console.log(`   - Time: ${response.data.processingTime}ms`);
      return true;
    } else if (response.data.message === 'No pending screenshots') {
      console.log('ℹ️  No screenshots to process');
      return false;
    }
  } catch (error) {
    console.error('❌ Batch processing failed:', error.response?.data || error.message);
    return false;
  }
}

// Verify context summaries
async function verifyContextSummaries(scenario) {
  console.log('\n📊 Verifying context summaries...');
  
  try {
    const response = await axios.post(`${API_URL}/api/productivity/context`, {
      userId: scenario.userId,
      action: 'getLatest'
    });
    
    if (!response.data.success || !response.data.summaries) {
      console.log('❌ No summaries found');
      return false;
    }
    
    const summaries = response.data.summaries;
    let allPassed = true;
    
    // Check each expected summary pattern
    for (const [window, pattern] of Object.entries(scenario.expectedSummary)) {
      const summary = summaries.find(s => s.window_type === window);
      
      if (!summary) {
        console.log(`❌ ${window}: No summary found`);
        allPassed = false;
        continue;
      }
      
      if (pattern.test(summary.summary_text)) {
        console.log(`✅ ${window}: "${summary.summary_text.substring(0, 60)}..."`);
      } else {
        console.log(`❌ ${window}: Pattern not matched`);
        console.log(`   Expected: ${pattern}`);
        console.log(`   Got: "${summary.summary_text}"`);
        allPassed = false;
      }
    }
    
    return allPassed;
    
  } catch (error) {
    console.error('❌ Failed to verify summaries:', error.message);
    return false;
  }
}

// Run test scenario
async function runScenario(roleKey) {
  const scenario = ROLE_SCENARIOS[roleKey];
  
  console.log('\n' + '='.repeat(60));
  console.log(`🧪 TESTING: ${roleKey.toUpperCase()} SCENARIO`);
  console.log('='.repeat(60));
  console.log(`User: ${scenario.userId}`);
  console.log(`Role: ${scenario.role}`);
  console.log(`Screenshots: ${scenario.screenshots.length}`);
  
  // Step 1: Simulate screenshots
  const captureResults = await simulateScreenshots(scenario);
  const successfulCaptures = captureResults.filter(r => r.success).length;
  console.log(`📊 Capture success rate: ${successfulCaptures}/${captureResults.length}`);
  
  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Step 2: Trigger batch processing
  const processed = await triggerBatchProcessing(scenario.userId);
  
  if (processed) {
    // Wait for summaries to be generated
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 3: Verify summaries
    const verified = await verifyContextSummaries(scenario);
    
    return {
      role: roleKey,
      captured: successfulCaptures,
      processed,
      verified
    };
  }
  
  return {
    role: roleKey,
    captured: successfulCaptures,
    processed: false,
    verified: false
  };
}

// Main test runner
async function runAllTests() {
  console.log('🎯 END-TO-END PRODUCTIVITY SYSTEM TEST');
  console.log('=====================================');
  console.log(`API: ${API_URL}`);
  console.log(`Roles: ${Object.keys(ROLE_SCENARIOS).join(', ')}`);
  
  const results = [];
  
  // Run each scenario
  for (const roleKey of Object.keys(ROLE_SCENARIOS)) {
    const result = await runScenario(roleKey);
    results.push(result);
    
    // Small delay between scenarios
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📋 TEST SUMMARY');
  console.log('='.repeat(60));
  
  let allPassed = true;
  results.forEach(result => {
    const status = result.verified ? '✅' : '❌';
    const details = `Captured: ${result.captured}, Processed: ${result.processed}, Verified: ${result.verified}`;
    console.log(`${status} ${result.role.toUpperCase()}: ${details}`);
    
    if (!result.verified) allPassed = false;
  });
  
  console.log('\n' + '='.repeat(60));
  if (allPassed) {
    console.log('🎉 ALL SCENARIOS PASSED!');
    console.log('The system correctly handles different role contexts:');
    console.log('- Recruiter: LinkedIn screening, interview scheduling');
    console.log('- Developer: Coding, testing, documentation');
    console.log('- Sales: CRM updates, proposals, client communication');
  } else {
    console.log('⚠️  Some scenarios failed. Check the details above.');
    console.log('\nTroubleshooting:');
    console.log('1. Ensure database migrations are run');
    console.log('2. Check API is running on', API_URL);
    console.log('3. Verify user profiles exist in database');
  }
  
  // Instructions for viewing results
  console.log('\n📊 VIEW RESULTS IN DASHBOARD:');
  console.log(`${API_URL}/productivity/ai-dashboard`);
  console.log('Select different users from the sidebar to see their summaries');
}

// Command line interface
if (process.argv[2]) {
  // Run specific scenario
  const role = process.argv[2];
  if (ROLE_SCENARIOS[role]) {
    runScenario(role).then(result => {
      console.log('\nResult:', result);
    });
  } else {
    console.log('Invalid role. Available roles:', Object.keys(ROLE_SCENARIOS).join(', '));
  }
} else {
  // Run all scenarios
  runAllTests().catch(error => {
    console.error('Test runner failed:', error);
    process.exit(1);
  });
}
