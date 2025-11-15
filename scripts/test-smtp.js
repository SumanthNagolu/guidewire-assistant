#!/usr/bin/env node

/**
 * Test Supabase SMTP Configuration
 * 
 * This script tests if SMTP is properly configured by:
 * 1. Checking Supabase auth settings
 * 2. Attempting to send a test email
 * 3. Verifying email delivery
 * 
 * Usage: node scripts/test-smtp.js <email-to-test>
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
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testSMTP(testEmail) {
  console.log('\n🧪 Testing Supabase SMTP Configuration\n');
  console.log('=' .repeat(50));
  
  if (!testEmail) {
    console.error('❌ Please provide an email address to test');
    console.log('Usage: node scripts/test-smtp.js <email@example.com>');
    process.exit(1);
  }
  
  console.log(`\n📧 Test Email: ${testEmail}`);
  console.log(`🌐 Supabase URL: ${SUPABASE_URL}\n`);
  
  try {
    // Step 1: Check if SMTP is configured (by checking if we can send an invite)
    console.log('1️⃣  Testing email sending via user invite...');
    
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(testEmail, {
      data: {
        test: true,
        source: 'smtp_test'
      }
    });
    
    if (error) {
      if (error.message.includes('rate limit') || error.message.includes('429')) {
        console.log('⚠️  Rate limit error - this means SMTP might be working but you hit limits');
        console.log('   Try again in a few minutes or check Supabase rate limit settings');
      } else if (error.message.includes('timeout') || error.message.includes('504')) {
        console.log('❌ Timeout error - SMTP connection is failing');
        console.log('   Check your SMTP settings in Supabase Dashboard');
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
      return;
    }
    
    console.log('✅ Email invite sent successfully!');
    console.log(`   User ID: ${data.user?.id}`);
    
    // Step 2: Check user status
    console.log('\n2️⃣  Checking user status...');
    const { data: userData, error: userError } = await supabase.auth.admin.getUserById(data.user.id);
    
    if (!userError && userData?.user) {
      console.log(`   Email: ${userData.user.email}`);
      console.log(`   Confirmed: ${userData.user.email_confirmed_at ? 'Yes ✅' : 'No ⏳'}`);
      console.log(`   Created: ${userData.user.created_at}`);
    }
    
    // Step 3: Cleanup test user
    console.log('\n3️⃣  Cleaning up test user...');
    const { error: deleteError } = await supabase.auth.admin.deleteUser(data.user.id);
    
    if (deleteError) {
      console.log(`⚠️  Could not delete test user: ${deleteError.message}`);
      console.log('   You can delete it manually from Supabase Dashboard');
    } else {
      console.log('✅ Test user deleted');
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log('\n✅ SMTP Test Complete!');
    console.log(`\n📬 Check ${testEmail} inbox (and spam folder) for the invite email.`);
    console.log('   If you received it, SMTP is working correctly! ✅');
    
  } catch (err) {
    console.error('\n❌ Test failed:', err.message);
    console.log('\n🔍 Troubleshooting:');
    console.log('1. Check Supabase Dashboard → Auth → SMTP Settings');
    console.log('2. Verify SMTP connection test passes');
    console.log('3. Check Supabase logs for detailed errors');
  }
}

const testEmail = process.argv[2];
testSMTP(testEmail).catch(console.error);

