import * as dotenv from 'dotenv';
import screenshot from 'screenshot-desktop';
import axios from 'axios';
import * as crypto from 'crypto';

// Load environment variables
dotenv.config();

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const USER_ID = process.env.USER_ID || 'admin@intimesolutions.com';
const CAPTURE_INTERVAL = parseInt(process.env.CAPTURE_INTERVAL || '30', 10) * 1000; // Default 30 seconds
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '60', 10);

// State
let lastScreenHash: string | null = null;
let captureInProgress = false;
let errorCount = 0;
const MAX_ERRORS = 5;

/**
 * Simple capture and upload function
 */
async function captureAndUpload(): Promise<void> {
  // Skip if already capturing
  if (captureInProgress) {
    console.log('⏭️  Skipping - capture already in progress');
    return;
  }
  
  captureInProgress = true;
  const startTime = Date.now();
  
  try {
    // Capture screenshot
    const imageBuffer = await screenshot({
      format: 'jpg',
      quality: SCREENSHOT_QUALITY
    });
    
    if (!imageBuffer) {
      throw new Error('Failed to capture screenshot');
    }
    
    // Calculate hash for idle detection
    const currentHash = crypto
      .createHash('md5')
      .update(imageBuffer)
      .digest('hex');
    
    // Check if screen has changed
    const idleDetected = (currentHash === lastScreenHash);
    
    // Get current system info
    const metadata = {
      systemTime: new Date().toISOString(),
      application: await getActiveApplication(),
      windowTitle: await getActiveWindowTitle(),
      captureTime: Date.now() - startTime
    };
    
    // Upload to API
    console.log(`📸 Uploading screenshot (${idleDetected ? 'IDLE' : 'ACTIVE'})...`);
    
    const response = await axios.post(
      `${API_URL}/api/productivity/capture`,
      {
        image: imageBuffer.toString('base64'),
        userId: USER_ID,
        timestamp: new Date().toISOString(),
        screenHash: currentHash,
        idleDetected,
        metadata
      },
      {
        timeout: 10000, // 10 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    if (response.data.success) {
      console.log('✅ Screenshot uploaded successfully');
      errorCount = 0; // Reset error count on success
    }
    
    // Update last hash
    lastScreenHash = currentHash;
    
  } catch (error: any) {
    errorCount++;
    console.error(`❌ Capture error (${errorCount}/${MAX_ERRORS}):`, error.message);
    
    // Exit if too many consecutive errors
    if (errorCount >= MAX_ERRORS) {
      console.error('🛑 Too many errors, exiting...');
      process.exit(1);
    }
  } finally {
    captureInProgress = false;
  }
}

/**
 * Get active application name (platform-specific)
 */
async function getActiveApplication(): Promise<string> {
  // This would need platform-specific implementation
  // For now, return a placeholder
  if (process.platform === 'darwin') {
    // macOS: Could use AppleScript
    return 'Application';
  } else if (process.platform === 'win32') {
    // Windows: Could use Windows API
    return 'Application';
  } else {
    // Linux: Could use X11/Wayland
    return 'Application';
  }
}

/**
 * Get active window title (platform-specific)
 */
async function getActiveWindowTitle(): Promise<string> {
  // This would need platform-specific implementation
  // For now, return a placeholder
  return 'Window Title';
}

/**
 * Display startup banner
 */
function displayBanner(): void {
  console.log(`
╔════════════════════════════════════════════╗
║     INTIME PRODUCTIVITY CAPTURE AGENT      ║
║         Lightweight & Efficient            ║
╚════════════════════════════════════════════╝

🔧 Configuration:
   API URL:     ${API_URL}
   User ID:     ${USER_ID}
   Interval:    ${CAPTURE_INTERVAL / 1000} seconds
   Quality:     ${SCREENSHOT_QUALITY}%

📸 Starting capture...
`);
}

/**
 * Main function
 */
async function main(): Promise<void> {
  displayBanner();
  
  // Test API connection
  try {
    console.log('🔗 Testing API connection...');
    await axios.get(`${API_URL}/api/health`).catch(() => {
      console.warn('⚠️  Health endpoint not available, continuing anyway...');
    });
  } catch (error) {
    console.error('❌ Failed to connect to API');
    process.exit(1);
  }
  
  // Capture immediately on start
  await captureAndUpload();
  
  // Set up interval
  const interval = setInterval(captureAndUpload, CAPTURE_INTERVAL);
  
  console.log(`✅ Agent started - capturing every ${CAPTURE_INTERVAL / 1000} seconds`);
  console.log('   Press Ctrl+C to stop\n');
  
  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    clearInterval(interval);
    process.exit(0);
  });
  
  process.on('SIGTERM', () => {
    console.log('\n👋 Shutting down...');
    clearInterval(interval);
    process.exit(0);
  });
}

// Start the agent
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
