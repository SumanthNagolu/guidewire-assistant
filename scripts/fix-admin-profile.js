#!/usr/bin/env node

// Fix admin profile role and onboarding status

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixAdminProfile() {
  console.log('🔧 Fixing admin profile...\n');

  try {
    // Get the user ID
    const { data: userData } = await supabase.auth.admin.listUsers();
    const adminUser = userData.users.find(u => u.email === 'admin@intimeesolutions.com');
    
    if (!adminUser) {
      throw new Error('Admin user not found!');
    }

    console.log('📝 Updating user profile...');
    
    // Update the profile
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: adminUser.id,
        email: 'admin@intimeesolutions.com',
        role: 'admin',
        first_name: 'Admin',
        last_name: 'User',
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select()
      .single();

    if (error) throw error;

    console.log('✅ Profile updated successfully!\n');
    console.log('📋 Current profile:');
    console.log('   ID:', data.id);
    console.log('   Email:', data.email);
    console.log('   Role:', data.role);
    console.log('   Name:', data.first_name, data.last_name);
    console.log('   Onboarding:', data.onboarding_completed);

    console.log('\n' + '='.repeat(50));
    console.log('✅ ADMIN SETUP COMPLETE!');
    console.log('='.repeat(50));
    console.log('\n📧 Login with:');
    console.log('   Email:    admin@intimeesolutions.com');
    console.log('   Password: test123!@#');
    console.log('\n🔗 Go to:');
    console.log('   http://localhost:3000/admin/login');
    console.log('\n🎉 Everything is ready!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

fixAdminProfile();

