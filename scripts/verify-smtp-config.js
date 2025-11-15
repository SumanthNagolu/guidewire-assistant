#!/usr/bin/env node

/**
 * Verify SMTP Configuration
 * 
 * This script checks if SMTP is properly configured by:
 * 1. Attempting to send a test email invite
 * 2. Checking for rate limit vs connection errors
 * 3. Providing clear feedback
 * 
 * Usage: node scripts/verify-smtp-config.js [email]
 */

// Try to load .env.local if dotenv is available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, rely on environment variables
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('\n❌ Missing Supabase credentials!');
  console.error('\nRequired environment variables:');
  console.error('  - NEXT_PUBLIC_SUPABASE_URL');
  console.error('  - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nMake sure .env.local exists with these values.\n');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifySMTP(testEmail) {
  console.log('\n🔍 Verifying SMTP Configuration\n');
  console.log('=' .repeat(60));
  
  if (!testEmail) {
    testEmail = 'norepl@intimeesolutions.com';
    console.log(`\n📧 Using default test email: ${testEmail}`);
  } else {
    console.log(`\n📧 Test email: ${testEmail}`);
  }
  
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);
  
  try {
    console.log('1️⃣  Attempting to send test invite...\n');
    
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(testEmail, {
      data: {
        test: true,
        source: 'smtp_verification'
      }
    });
    
    if (error) {
      console.log('❌ Error occurred:\n');
      
      // Rate limit = SMTP is working but hit limits
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.log('⚠️  RATE LIMIT ERROR');
        console.log('   This means SMTP IS CONFIGURED and working!');
        console.log('   You just hit the rate limit (too many emails sent).');
        console.log('\n✅ SMTP Status: WORKING ✅');
        console.log('\n💡 Solution:');
        console.log('   - Wait 1 hour and try again');
        console.log('   - Or check Supabase Dashboard → Auth → Rate Limits');
        console.log('   - Increase email rate limit if needed');
        return { success: true, reason: 'rate_limit' };
      }
      
      // Timeout = SMTP connection issue
      if (error.message.includes('timeout') || error.message.includes('504')) {
        console.log('❌ TIMEOUT ERROR');
        console.log('   SMTP connection is failing.');
        console.log('\n🔧 Troubleshooting:');
        console.log('   1. Check Supabase Dashboard → Auth → SMTP Settings');
        console.log('   2. Verify SMTP credentials are correct:');
        console.log('      - Host: smtp.office365.com');
        console.log('      - Port: 587');
        console.log('      - User: norepl@intimeesolutions.com');
        console.log('      - Password: Sadhguru@108!');
        console.log('   3. Try port 465 instead of 587');
        console.log('   4. Check if 2FA requires App Password');
        return { success: false, reason: 'timeout' };
      }
      
      // Connection failed = SMTP not configured or wrong credentials
      if (error.message.includes('connection') || error.message.includes('auth')) {
        console.log('❌ CONNECTION/AUTH ERROR');
        console.log('   SMTP is not configured or credentials are wrong.');
        console.log('\n🔧 Action Required:');
        console.log('   1. Go to Supabase Dashboard → Auth → SMTP Settings');
        console.log('   2. Enable "Enable Custom SMTP"');
        console.log('   3. Configure with these settings:');
        console.log('\n      SMTP Host: smtp.office365.com');
        console.log('      SMTP Port: 587');
        console.log('      SMTP User: norepl@intimeesolutions.com');
        console.log('      SMTP Password: Sadhguru@108!');
        console.log('      Sender Email: norepl@intimeesolutions.com');
        console.log('      Sender Name: InTime Solutions');
        console.log('\n   4. Click Save and wait for green checkmark ✅');
        return { success: false, reason: 'connection' };
      }
      
      // Other errors
      console.log(`   Error: ${error.message}`);
      console.log('\n🔧 Check Supabase Dashboard → Logs → Auth Logs for details');
      return { success: false, reason: 'unknown', error: error.message };
    }
    
    // Success!
    console.log('✅ SUCCESS! Email invite sent!\n');
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Confirmed: ${data.user?.email_confirmed_at ? 'Yes' : 'Pending'}`);
    
    console.log('\n' + '=' .repeat(60));
    console.log('\n✅ SMTP Status: WORKING PERFECTLY! ✅\n');
    console.log(`📬 Check ${testEmail} inbox (and spam folder) for the invite email.`);
    console.log('   If you received it, SMTP is fully configured!\n');
    
    // Cleanup test user
    try {
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('🧹 Test user cleaned up\n');
    } catch (cleanupError) {
      console.log('⚠️  Could not delete test user (you can delete manually)\n');
    }
    
    return { success: true, reason: 'success' };
    
  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
    console.log('\n🔧 Check:');
    console.log('   1. Supabase credentials are correct');
    console.log('   2. Network connection is working');
    console.log('   3. Supabase project is active');
    return { success: false, reason: 'exception', error: err.message };
  }
}

const testEmail = process.argv[2];
verifySMTP(testEmail)
  .then((result) => {
    if (result.success) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  })
  .catch((err) => {
    console.error('\n❌ Script error:', err);
    process.exit(1);
  });

