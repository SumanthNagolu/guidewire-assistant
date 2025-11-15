#!/usr/bin/env node

// One-time script to set admin password
// Run with: node scripts/set-admin-password.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdminUser() {
  console.log('🔧 Setting up admin user...\n');

  try {
    // Step 1: Find the user
    console.log('📝 Step 1: Finding user...');
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) throw userError;
    
    const adminUser = userData.users.find(u => u.email === 'admin@intimeesolutions.com');
    
    if (!adminUser) {
      console.error('❌ User admin@intimeesolutions.com not found in auth.users!');
      console.error('Please create the user in Supabase Dashboard first.');
      process.exit(1);
    }

    console.log('✅ Found user:', adminUser.id);
    console.log('   Email:', adminUser.email);
    console.log('   Created:', adminUser.created_at);

    // Step 2: Update password
    console.log('\n📝 Step 2: Setting password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { 
        password: 'test123!@#',
        email_confirm: true
      }
    );

    if (updateError) throw updateError;

    console.log('✅ Password set successfully!');

    // Step 3: Verify
    console.log('\n📝 Step 3: Verifying setup...');
    const { data: verifyData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', 'admin@intimeesolutions.com')
      .single();

    if (verifyData) {
      console.log('✅ User profile verified:');
      console.log('   Role:', verifyData.role);
      console.log('   Onboarding:', verifyData.onboarding_completed);
      console.log('   Name:', verifyData.first_name, verifyData.last_name);
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ SETUP COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📧 Login credentials:');
    console.log('   Email:    admin@intimeesolutions.com');
    console.log('   Password: test123!@#');
    console.log('\n🔗 Admin login URL:');
    console.log('   http://localhost:3000/admin/login');
    console.log('\n🎉 You can now log in as admin!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nFull error:', error);
    process.exit(1);
  }
}

setupAdminUser();

