import * as dotenv from 'dotenv';
import screenshot from 'screenshot-desktop';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

dotenv.config();

const API_URL = process.env.API_URL || 'http://localhost:3000';
const USER_ID = process.env.USER_ID || 'admin@intimesolutions.com';
const SCREENSHOT_INTERVAL_SECONDS = parseInt(process.env.SCREENSHOT_INTERVAL_SECONDS || '30', 10);
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '50', 10);

const storageDir = path.join(os.tmpdir(), 'intime-screenshots');

function ensureStorageDir() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
}

/**
 * NEW FLOW: Just capture and send to DB
 * AI processing happens in batches every 5 minutes
 */
async function captureAndSendScreenshot() {
  try {
    console.log('📸 Capturing screenshot...');
    const filename = `screenshot_${Date.now()}.jpg`;
    const filepath = path.join(storageDir, filename);

    const imgBuffer = await screenshot({
      format: 'jpg',
      quality: SCREENSHOT_QUALITY,
      screen: 0 // Primary screen only for now
    } as any);

    if (!imgBuffer) {
      console.error('Failed to capture screenshot');
      return;
    }

    fs.writeFileSync(filepath, imgBuffer);
    console.log(`✅ Screenshot saved locally: ${filename}`);

    const imageBase64 = imgBuffer.toString('base64');

    // Send to AI analysis endpoint (works perfectly!)
    console.log('📤 Sending to AI analysis...');
    const response = await axios.post(`${API_URL}/api/productivity/ai-analyze`, {
      image: imageBase64,
      timestamp: new Date().toISOString(),
      userId: USER_ID,
      application: 'Cursor'
    });

    if (response.data.success) {
      console.log('✅ AI Analysis Complete!');
      console.log(`   📊 Application: ${response.data.analysis.application}`);
      console.log(`   📈 Category: ${response.data.analysis.category}`);
      console.log(`   💯 Productivity: ${response.data.analysis.productivityScore}`);
      if (response.data.workSummaryGenerated) {
        console.log('   ✨ Work summary generated!');
      }
    }

    // Clean up local file
    fs.unlinkSync(filepath);

  } catch (error: any) {
    console.error('❌ AI Analysis Error:', error.message);
    if (error.response) {
      console.error('   API Response:', error.response.data);
      console.error('   Status:', error.response.status);
    }
  }
}

async function startAgent() {
  ensureStorageDir();
  console.log('🚀 AI Screenshot Agent Starting...');
  console.log(`   📍 API URL: ${API_URL}`);
  console.log(`   👤 User: ${USER_ID}`);
  console.log(`   ⏱️  Capture Interval: ${SCREENSHOT_INTERVAL_SECONDS} seconds`);
  console.log(`   🎨 Quality: ${SCREENSHOT_QUALITY}`);
  console.log('');
  console.log('📊 CURRENT FLOW:');
  console.log('   1️⃣  Screenshots → Claude AI Analysis (every 30s)');
  console.log('   2️⃣  AI analyzes productivity & context');
  console.log('   3️⃣  Hierarchical summaries generated');
  console.log('   4️⃣  Dashboard updates in real-time');
  console.log('');

  // Capture immediately on start
  await captureAndSendScreenshot();

  // Then capture at interval
  setInterval(captureAndSendScreenshot, SCREENSHOT_INTERVAL_SECONDS * 1000);

  console.log('✅ Agent started successfully!');
  console.log(`   📸 Capturing screenshots every ${SCREENSHOT_INTERVAL_SECONDS} seconds`);
  console.log('   🤖 AI analyzing with Claude Vision');
  console.log('   📊 Generating work summaries automatically');
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down agent...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down agent...');
  process.exit(0);
});

startAgent();