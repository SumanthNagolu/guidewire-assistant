#!/usr/bin/env node

/**
 * Test script for unified productivity system
 * Tests the complete flow: capture → batch → context → dashboard
 */

const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:3000';
const USER_ID = process.env.USER_ID || 'admin@intimesolutions.com';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testCaptureEndpoint() {
  log('\n📸 Testing Capture Endpoint...', 'cyan');
  
  try {
    // Create a mock screenshot (small base64 image)
    const mockImage = Buffer.from('test-image-data').toString('base64');
    
    const response = await axios.post(`${API_URL}/api/productivity/capture`, {
      image: mockImage,
      userId: USER_ID,
      timestamp: new Date().toISOString(),
      screenHash: 'test-hash-12345',
      idleDetected: false,
      metadata: {
        systemTime: new Date().toISOString(),
        application: 'Test Application',
        windowTitle: 'Test Window'
      }
    });
    
    if (response.data.success) {
      log('✅ Capture endpoint working!', 'green');
      log(`   Screenshot ID: ${response.data.screenshotId}`, 'green');
      return true;
    }
  } catch (error) {
    log(`❌ Capture test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function testBatchProcessing() {
  log('\n🔄 Testing Batch Processing...', 'cyan');
  
  try {
    const response = await axios.post(`${API_URL}/api/productivity/batch-process`, {
      userId: USER_ID
    });
    
    if (response.data.success || response.data.message === 'No pending screenshots') {
      log('✅ Batch processing endpoint working!', 'green');
      if (response.data.processed) {
        log(`   Processed: ${response.data.processed} screenshots`, 'green');
        log(`   Context windows: ${response.data.contextWindows?.join(', ') || 'N/A'}`, 'green');
        log(`   Cost savings: ${response.data.costSavings || 'N/A'}`, 'green');
      } else {
        log('   No screenshots to process', 'yellow');
      }
      return true;
    }
  } catch (error) {
    log(`❌ Batch processing test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function testContextAPI() {
  log('\n📊 Testing Context API...', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_URL}/api/productivity/context?userId=${USER_ID}`
    );
    
    if (response.data.success) {
      log('✅ Context API working!', 'green');
      const summaries = response.data.summaries;
      const windows = Object.keys(summaries);
      
      if (windows.length > 0) {
        log(`   Found ${windows.length} context windows:`, 'green');
        windows.forEach(window => {
          const count = summaries[window].length;
          log(`   - ${window}: ${count} summaries`, 'green');
        });
      } else {
        log('   No context summaries yet', 'yellow');
      }
      return true;
    }
  } catch (error) {
    log(`❌ Context API test failed: ${error.message}`, 'red');
    if (error.response) {
      log(`   Response: ${JSON.stringify(error.response.data)}`, 'red');
    }
    return false;
  }
}

async function testDashboardAccess() {
  log('\n🌐 Testing Dashboard Access...', 'cyan');
  
  try {
    const response = await axios.get(
      `${API_URL}/productivity/ai-dashboard`,
      { maxRedirects: 0, validateStatus: (status) => status < 400 }
    );
    
    if (response.status === 200) {
      log('✅ Dashboard is accessible!', 'green');
      log(`   URL: ${API_URL}/productivity/ai-dashboard`, 'green');
      return true;
    }
  } catch (error) {
    if (error.response?.status === 302 || error.response?.status === 308) {
      log('⚠️  Dashboard requires authentication', 'yellow');
      log(`   URL: ${API_URL}/productivity/ai-dashboard`, 'yellow');
      return true;
    }
    log(`❌ Dashboard test failed: ${error.message}`, 'red');
    return false;
  }
}

async function runAllTests() {
  log('🧪 UNIFIED PRODUCTIVITY SYSTEM TEST', 'blue');
  log('===================================', 'blue');
  log(`API URL: ${API_URL}`, 'blue');
  log(`User ID: ${USER_ID}`, 'blue');
  
  const results = {
    capture: await testCaptureEndpoint(),
    batch: await testBatchProcessing(),
    context: await testContextAPI(),
    dashboard: await testDashboardAccess()
  };
  
  // Summary
  log('\n📋 TEST SUMMARY', 'blue');
  log('===============', 'blue');
  
  const passed = Object.values(results).filter(r => r).length;
  const total = Object.values(results).length;
  
  Object.entries(results).forEach(([test, passed]) => {
    const status = passed ? '✅' : '❌';
    const color = passed ? 'green' : 'red';
    log(`${status} ${test.charAt(0).toUpperCase() + test.slice(1)} Test`, color);
  });
  
  log(`\nPassed: ${passed}/${total}`, passed === total ? 'green' : 'yellow');
  
  if (passed === total) {
    log('\n🎉 All tests passed! The unified system is working correctly.', 'green');
  } else {
    log('\n⚠️  Some tests failed. Please check the errors above.', 'yellow');
  }
  
  // Instructions
  log('\n📝 NEXT STEPS:', 'cyan');
  log('1. Ensure the database migrations have been run', 'cyan');
  log('2. Start the capture agent: cd productivity-capture && npm run dev', 'cyan');
  log('3. Wait for screenshots to accumulate (10+)', 'cyan');
  log('4. Check the dashboard for human-like summaries', 'cyan');
}

// Run the tests
runAllTests().catch(error => {
  log(`\n💥 Test runner error: ${error.message}`, 'red');
  process.exit(1);
});
