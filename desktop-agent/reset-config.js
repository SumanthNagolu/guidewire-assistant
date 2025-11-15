const fs = require('fs');
const path = require('path');
const os = require('os');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const configPath = path.join(os.homedir(), '.intime-agent', 'config.json');

const newConfig = {
  apiUrl: process.env.API_URL || 'http://localhost:3000',
  apiKey: '',
  dashboardUrl: process.env.DASHBOARD_URL || 'http://localhost:3000/productivity',
  screenshotsEnabled: true,
  screenshotInterval: 300000,
  screenshotQuality: 50,
  syncInterval: 300000,
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
  rememberMe: false
};

const configDir = path.dirname(configPath);
if (!fs.existsSync(configDir)) {
  fs.mkdirSync(configDir, { recursive: true });
}

fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2));

console.log('✅ Config reset successfully!');
console.log('📁 Config location:', configPath);
console.log('📝 New config:', JSON.stringify(newConfig, null, 2));
