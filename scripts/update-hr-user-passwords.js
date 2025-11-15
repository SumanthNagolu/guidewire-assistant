#!/usr/bin/env node
/**
 * Update passwords for existing HR and Employee users
 * Uses Supabase Admin API to update passwords
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function updatePasswords() {
  console.log('🔐 Updating passwords for HR and Employee users...\n');

  try {
    // List all users to find the ones we need
    console.log('🔍 Finding existing users...');
    const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      throw listError;
    }

    const hrUser = usersData?.users?.find(u => u.email === 'hr@intimeesolutions.com');
    const empUser = usersData?.users?.find(u => u.email === 'employee@intimeesolutions.com');

    if (!hrUser) {
      console.log('❌ HR user not found. Please create it first.');
    } else {
      console.log('✅ Found HR user:', hrUser.id);
      console.log('   Updating password...');
      const { error: hrError } = await supabase.auth.admin.updateUserById(hrUser.id, {
        password: 'test12345',
        email_confirm: true
      });
      if (hrError) {
        console.log('   ⚠️  Error:', hrError.message);
      } else {
        console.log('   ✅ Password updated successfully');
      }
    }

    if (!empUser) {
      console.log('\n❌ Employee user not found. Please create it first.');
    } else {
      console.log('\n✅ Found Employee user:', empUser.id);
      console.log('   Updating password...');
      const { error: empError } = await supabase.auth.admin.updateUserById(empUser.id, {
        password: 'test12345',
        email_confirm: true
      });
      if (empError) {
        console.log('   ⚠️  Error:', empError.message);
      } else {
        console.log('   ✅ Password updated successfully');
      }
    }

    console.log('\n🎉 Password update complete!');
    console.log('\n📋 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('HR Manager:');
    console.log('  Email: hr@intimeesolutions.com');
    console.log('  Password: test12345');
    console.log('\nEmployee:');
    console.log('  Email: employee@intimeesolutions.com');
    console.log('  Password: test12345');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.details) {
      console.error('Details:', error.details);
    }
    process.exit(1);
  }
}

// Run the script
updatePasswords();

