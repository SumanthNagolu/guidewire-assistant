#!/usr/bin/env node

/**
 * Supabase SMTP Setup Helper Script
 * 
 * This script helps you configure SMTP for Supabase by:
 * 1. Guiding you through App Password creation (Outlook)
 * 2. Providing exact SMTP settings to use
 * 3. Testing the configuration
 * 
 * Usage: node scripts/setup-smtp.js
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('\n🚀 Supabase SMTP Configuration Helper\n');
  console.log('=' .repeat(50));
  
  // Step 1: Choose provider
  console.log('\n📧 Choose your email provider:');
  console.log('1. Outlook/Hotmail (s.nagolu@hotmail.com)');
  console.log('2. Resend (Recommended for production)');
  
  const providerChoice = await question('\nEnter choice (1 or 2): ');
  
  if (providerChoice === '1') {
    await setupOutlook();
  } else if (providerChoice === '2') {
    await setupResend();
  } else {
    console.log('❌ Invalid choice. Exiting.');
    rl.close();
    return;
  }
  
  rl.close();
}

async function setupOutlook() {
  console.log('\n📋 Outlook/Hotmail SMTP Setup\n');
  console.log('=' .repeat(50));
  
  console.log('\n⚠️  IMPORTANT: You need an App Password, not your regular password!');
  console.log('\n📝 Step 1: Create App Password');
  console.log('1. Go to: https://account.microsoft.com/security');
  console.log('2. Sign in with: s.nagolu@hotmail.com');
  console.log('3. Navigate to: Security → Advanced security options');
  console.log('4. Under "App passwords", click "Create a new app password"');
  console.log('5. Name it: "Supabase SMTP"');
  console.log('6. Copy the generated password (16 characters)');
  
  const hasAppPassword = await question('\n✅ Do you have your App Password ready? (yes/no): ');
  
  if (hasAppPassword.toLowerCase() !== 'yes') {
    console.log('\n⏸️  Please create an App Password first, then run this script again.');
    return;
  }
  
  const appPassword = await question('\n🔑 Enter your App Password: ');
  
  if (!appPassword || appPassword.length < 16) {
    console.log('❌ App Password seems invalid. It should be 16 characters.');
    return;
  }
  
  console.log('\n✅ Perfect! Here are your SMTP settings:\n');
  console.log('=' .repeat(50));
  console.log('\n📧 Copy these settings to Supabase Dashboard:');
  console.log('\nSMTP Host: smtp.office365.com');
  console.log('SMTP Port: 587');
  console.log('SMTP User: s.nagolu@hotmail.com');
  console.log(`SMTP Password: ${appPassword.substring(0, 4)}...${appPassword.substring(appPassword.length - 4)}`);
  console.log('Sender Email: s.nagolu@hotmail.com');
  console.log('Sender Name: InTime Solutions');
  console.log('\n' + '=' .repeat(50));
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to: Project Settings → Auth → SMTP Settings');
  console.log('4. Enable "Enable Custom SMTP"');
  console.log('5. Paste the settings above');
  console.log('6. Click "Save"');
  console.log('7. Wait for the connection test (green checkmark ✅)');
  
  const done = await question('\n✅ Have you configured SMTP in Supabase Dashboard? (yes/no): ');
  
  if (done.toLowerCase() === 'yes') {
    console.log('\n🧹 Now let\'s clean up failed invites...');
    console.log('\nRun this SQL in Supabase SQL Editor:');
    console.log('\n' + '=' .repeat(50));
    console.log(`
-- Clean up failed invites
DELETE FROM auth.users 
WHERE email = 's.nagolu@hotmail.com' 
  AND email_confirmed_at IS NULL;
    `.trim());
    console.log('\n' + '=' .repeat(50));
    
    console.log('\n✅ Setup complete! Test by inviting a user again.');
  } else {
    console.log('\n⏸️  Please configure SMTP in Supabase Dashboard first.');
  }
}

async function setupResend() {
  console.log('\n📋 Resend SMTP Setup\n');
  console.log('=' .repeat(50));
  
  console.log('\n📝 Step 1: Get Resend API Key');
  console.log('1. Go to: https://resend.com/api-keys');
  console.log('2. Create an API key if you don\'t have one');
  console.log('3. Copy the API key');
  
  const hasApiKey = await question('\n✅ Do you have your Resend API Key? (yes/no): ');
  
  if (hasApiKey.toLowerCase() !== 'yes') {
    console.log('\n⏸️  Please get your Resend API Key first.');
    return;
  }
  
  const apiKey = await question('\n🔑 Enter your Resend API Key: ');
  
  if (!apiKey || !apiKey.startsWith('re_')) {
    console.log('❌ Resend API Key should start with "re_"');
    return;
  }
  
  console.log('\n📝 Step 2: Domain Setup');
  console.log('1. Go to: https://resend.com/domains');
  console.log('2. Add your domain: intimesolutions.com');
  console.log('3. Verify your domain (add DNS records)');
  console.log('4. Wait for verification (can take a few minutes)');
  
  const domainVerified = await question('\n✅ Is your domain verified in Resend? (yes/no): ');
  
  const senderEmail = domainVerified.toLowerCase() === 'yes' 
    ? 'noreply@intimesolutions.com'
    : 'onboarding@resend.dev'; // Resend test domain
  
  console.log('\n✅ Perfect! Here are your SMTP settings:\n');
  console.log('=' .repeat(50));
  console.log('\n📧 Copy these settings to Supabase Dashboard:');
  console.log('\nSMTP Host: smtp.resend.com');
  console.log('SMTP Port: 587');
  console.log('SMTP User: resend');
  console.log(`SMTP Password: ${apiKey.substring(0, 8)}...`);
  console.log(`Sender Email: ${senderEmail}`);
  console.log('Sender Name: InTime Solutions');
  console.log('\n' + '=' .repeat(50));
  
  console.log('\n📋 Next Steps:');
  console.log('1. Go to: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to: Project Settings → Auth → SMTP Settings');
  console.log('4. Enable "Enable Custom SMTP"');
  console.log('5. Paste the settings above');
  console.log('6. Click "Save"');
  console.log('7. Wait for the connection test (green checkmark ✅)');
  
  const done = await question('\n✅ Have you configured SMTP in Supabase Dashboard? (yes/no): ');
  
  if (done.toLowerCase() === 'yes') {
    console.log('\n🧹 Now let\'s clean up failed invites...');
    console.log('\nRun this SQL in Supabase SQL Editor:');
    console.log('\n' + '=' .repeat(50));
    console.log(`
-- Clean up failed invites
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL;
    `.trim());
    console.log('\n' + '=' .repeat(50));
    
    console.log('\n✅ Setup complete! Test by inviting a user again.');
  } else {
    console.log('\n⏸️  Please configure SMTP in Supabase Dashboard first.');
  }
}

main().catch(console.error);

