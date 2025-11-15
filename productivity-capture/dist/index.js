"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
const screenshot_desktop_1 = __importDefault(require("screenshot-desktop"));
const axios_1 = __importDefault(require("axios"));
const crypto = __importStar(require("crypto"));
// Load environment variables
dotenv.config();
// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000';
const USER_ID = process.env.USER_ID || 'admin@intimesolutions.com';
const CAPTURE_INTERVAL = parseInt(process.env.CAPTURE_INTERVAL || '30', 10) * 1000; // Default 30 seconds
const SCREENSHOT_QUALITY = parseInt(process.env.SCREENSHOT_QUALITY || '60', 10);
// State
let lastScreenHash = null;
let captureInProgress = false;
let errorCount = 0;
const MAX_ERRORS = 5;
/**
 * Simple capture and upload function
 */
async function captureAndUpload() {
    // Skip if already capturing
    if (captureInProgress) {
        console.log('⏭️  Skipping - capture already in progress');
        return;
    }
    captureInProgress = true;
    const startTime = Date.now();
    try {
        // Capture screenshot
        const imageBuffer = await (0, screenshot_desktop_1.default)({
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
        const response = await axios_1.default.post(`${API_URL}/api/productivity/capture`, {
            image: imageBuffer.toString('base64'),
            userId: USER_ID,
            timestamp: new Date().toISOString(),
            screenHash: currentHash,
            idleDetected,
            metadata
        }, {
            timeout: 10000, // 10 second timeout
            headers: {
                'Content-Type': 'application/json'
            }
        });
        if (response.data.success) {
            console.log('✅ Screenshot uploaded successfully');
            errorCount = 0; // Reset error count on success
        }
        // Update last hash
        lastScreenHash = currentHash;
    }
    catch (error) {
        errorCount++;
        console.error(`❌ Capture error (${errorCount}/${MAX_ERRORS}):`, error.message);
        // Exit if too many consecutive errors
        if (errorCount >= MAX_ERRORS) {
            console.error('🛑 Too many errors, exiting...');
            process.exit(1);
        }
    }
    finally {
        captureInProgress = false;
    }
}
/**
 * Get active application name (platform-specific)
 */
async function getActiveApplication() {
    // This would need platform-specific implementation
    // For now, return a placeholder
    if (process.platform === 'darwin') {
        // macOS: Could use AppleScript
        return 'Application';
    }
    else if (process.platform === 'win32') {
        // Windows: Could use Windows API
        return 'Application';
    }
    else {
        // Linux: Could use X11/Wayland
        return 'Application';
    }
}
/**
 * Get active window title (platform-specific)
 */
async function getActiveWindowTitle() {
    // This would need platform-specific implementation
    // For now, return a placeholder
    return 'Window Title';
}
/**
 * Display startup banner
 */
function displayBanner() {
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
async function main() {
    displayBanner();
    // Test API connection
    try {
        console.log('🔗 Testing API connection...');
        await axios_1.default.get(`${API_URL}/api/health`).catch(() => {
            console.warn('⚠️  Health endpoint not available, continuing anyway...');
        });
    }
    catch (error) {
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
