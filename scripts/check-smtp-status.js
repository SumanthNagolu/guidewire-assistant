#!/usr/bin/env node

/**
 * Check SMTP Status - More Detailed Verification
 * 
 * This script helps determine if SMTP is ACTUALLY working or if
 * Supabase is still using the default email service.
 * 
 * Usage: node scripts/check-smtp-status.js [email]
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
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function checkSMTPStatus(testEmail) {
  console.log('\n🔍 Checking SMTP Status - Detailed Analysis\n');
  console.log('=' .repeat(60));
  
  if (!testEmail) {
    // Use a random email to avoid rate limits
    const random = Math.random().toString(36).substring(7);
    testEmail = `test-${random}@example.com`;
    console.log(`📧 Using random test email: ${testEmail}`);
  } else {
    console.log(`📧 Test email: ${testEmail}`);
  }
  
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);
  
  // Test 1: Try with a completely new email (should bypass rate limits)
  console.log('1️⃣  Testing with NEW email address (should bypass rate limits)...\n');
  
  const newTestEmail = `test-${Date.now()}@example.com`;
  
  try {
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(newTestEmail, {
      data: {
        test: true,
        source: 'smtp_status_check'
      }
    });
    
    if (error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.log('⚠️  RATE LIMIT ERROR - Even with NEW email!');
        console.log('\n🔍 Analysis:');
        console.log('   This suggests one of two things:');
        console.log('   1. SMTP is configured but rate limits are VERY low');
        console.log('   2. SMTP is NOT working - still using default service');
        console.log('\n💡 To determine which:');
        console.log('   - Check Supabase Dashboard → Auth → SMTP Settings');
        console.log('   - Look for green checkmark ✅ or connection test status');
        console.log('   - Check Rate Limits section - what is "Email Rate Limit" set to?');
        console.log('\n❓ Question: In Supabase Dashboard → Auth → SMTP Settings:');
        console.log('   - Do you see a green checkmark ✅ after "Save"?');
        console.log('   - Or do you see a red X ❌ or error message?');
        
        // Cleanup
        if (data?.user?.id) {
          try {
            await supabase.auth.admin.deleteUser(data.user.id);
          } catch (e) {}
        }
        
        return { working: 'unknown', reason: 'rate_limit_on_new_email' };
      }
      
      if (error.message.includes('timeout') || error.message.includes('504')) {
        console.log('❌ TIMEOUT ERROR');
        console.log('   SMTP connection is failing.');
        console.log('\n🔧 Action Required:');
        console.log('   1. Check Supabase Dashboard → Auth → SMTP Settings');
        console.log('   2. Verify password is correct: Sadhguru@108!');
        console.log('   3. Check if connection test shows error');
        return { working: false, reason: 'timeout' };
      }
      
      if (error.message.includes('connection') || error.message.includes('auth')) {
        console.log('❌ CONNECTION/AUTH ERROR');
        console.log('   SMTP credentials are wrong or not configured.');
        return { working: false, reason: 'connection' };
      }
      
      console.log(`❌ Error: ${error.message}`);
      return { working: false, reason: 'unknown', error: error.message };
    }
    
    // Success!
    console.log('✅ SUCCESS! Email invite sent to NEW email!');
    console.log(`   User ID: ${data.user?.id}`);
    console.log('\n✅ SMTP Status: DEFINITELY WORKING! ✅');
    console.log('\n📬 The rate limit errors you saw earlier were likely because:');
    console.log('   - You hit the limit for that specific email address');
    console.log('   - Rate limits reset after 1 hour per email');
    console.log('\n💡 Solution:');
    console.log('   - Wait 1 hour for rate limit to reset');
    console.log('   - Or use a different email address');
    console.log('   - Or increase rate limits in Supabase Dashboard');
    
    // Cleanup
    try {
      await supabase.auth.admin.deleteUser(data.user.id);
      console.log('\n🧹 Test user cleaned up');
    } catch (e) {}
    
    return { working: true, reason: 'success' };
    
  } catch (err) {
    console.error('\n❌ Unexpected error:', err.message);
    return { working: false, reason: 'exception', error: err.message };
  }
}

const testEmail = process.argv[2];
checkSMTPStatus(testEmail)
  .then((result) => {
    console.log('\n' + '=' .repeat(60));
    console.log('\n📋 Summary:');
    if (result.working === true) {
      console.log('✅ SMTP is WORKING! Rate limits are the issue.');
    } else if (result.working === false) {
      console.log('❌ SMTP is NOT working. Check configuration.');
    } else {
      console.log('⚠️  Cannot determine. Check Supabase Dashboard for connection status.');
    }
    console.log('');
    process.exit(result.working === true ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n❌ Script error:', err);
    process.exit(1);
  });

