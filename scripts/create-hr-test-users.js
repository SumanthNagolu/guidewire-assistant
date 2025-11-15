#!/usr/bin/env node
/**
 * Create HR and Employee Test Users
 * Uses Supabase Admin API to create users properly
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function createHRUsers() {
  console.log('🚀 Creating HR and Employee test users...\n');

  try {
    // Check if users already exist
    console.log('🔍 Checking for existing users...');
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existingHR = existingUsers?.users?.find(u => u.email === 'hr@intimeesolutions.com');
    const existingEmp = existingUsers?.users?.find(u => u.email === 'employee@intimeesolutions.com');

    let hrUserId, empUserId;

    // Handle HR Manager user
    if (existingHR) {
      console.log('⚠️  HR user already exists, updating password...');
      hrUserId = existingHR.id;
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingHR.id, {
        password: 'test12345',
        email_confirm: true
      });
      if (updateError) {
        console.log('⚠️  Could not update password:', updateError.message);
      } else {
        console.log('✅ HR user password updated');
      }
      await updateUserProfile(hrUserId, 'hr_manager', 'HR', 'Manager');
    } else {
      console.log('👤 Creating HR Manager user...');
      const { data: hrUser, error: hrError } = await supabase.auth.admin.createUser({
        email: 'hr@intimeesolutions.com',
        password: 'test12345',
        email_confirm: true,
        user_metadata: {
          full_name: 'HR Manager',
          role: 'hr_manager'
        }
      });

      if (hrError) {
        console.error('❌ Error creating HR user:', hrError);
        console.error('   Message:', hrError.message);
        console.error('   Status:', hrError.status);
        if (hrError.details) {
          console.error('   Details:', hrError.details);
        }
        throw hrError;
      }
      hrUserId = hrUser.user.id;
      console.log('✅ HR Manager user created:', hrUserId);
      await updateUserProfile(hrUserId, 'hr_manager', 'HR', 'Manager');
    }

    // Handle Employee user
    if (existingEmp) {
      console.log('\n⚠️  Employee user already exists, updating password...');
      empUserId = existingEmp.id;
      // Update password
      const { error: updateError } = await supabase.auth.admin.updateUserById(existingEmp.id, {
        password: 'test12345',
        email_confirm: true
      });
      if (updateError) {
        console.log('⚠️  Could not update password:', updateError.message);
      } else {
        console.log('✅ Employee user password updated');
      }
      await updateUserProfile(empUserId, 'employee', 'Test', 'Employee');
    } else {
      console.log('\n👤 Creating Employee user...');
      const { data: empUser, error: empError } = await supabase.auth.admin.createUser({
        email: 'employee@intimeesolutions.com',
        password: 'test12345',
        email_confirm: true,
        user_metadata: {
          full_name: 'Test Employee',
          role: 'employee'
        }
      });

      if (empError) {
        console.error('❌ Error creating Employee user:', empError);
        console.error('   Message:', empError.message);
        console.error('   Status:', empError.status);
        if (empError.details) {
          console.error('   Details:', empError.details);
        }
        throw empError;
      }
      empUserId = empUser.user.id;
      console.log('✅ Employee user created:', empUserId);
      await updateUserProfile(empUserId, 'employee', 'Test', 'Employee');
    }

    console.log('\n🎉 Users created successfully!');
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
    console.error('\n❌ Error creating users:', error.message);
    process.exit(1);
  }
}

async function updateUserProfile(userId, role, firstName, lastName) {
  try {
    // Ensure roles exist
    const { data: hrRole } = await supabase
      .from('roles')
      .select('id')
      .eq('code', role === 'hr_manager' ? 'hr_manager' : 'employee')
      .single();

    if (!hrRole) {
      console.log(`⚠️  Role '${role}' not found, creating it...`);
      const { data: newRole } = await supabase
        .from('roles')
        .insert({
          code: role === 'hr_manager' ? 'hr_manager' : 'employee',
          name: role === 'hr_manager' ? 'HR Manager' : 'Employee',
          description: role === 'hr_manager' 
            ? 'Human Resources Manager - Full HR access' 
            : 'Employee - Self-service access',
          priority: role === 'hr_manager' ? 80 : 20,
          permissions: role === 'hr_manager'
            ? { hr: 'full', employees: 'full', timesheets: 'full', leave: 'full', expenses: 'full' }
            : { self: true, timesheets: 'own', leave: 'own', expenses: 'own', profile: 'own' }
        })
        .select('id')
        .single();
      
      if (newRole) {
        await updateUserProfileWithRole(userId, newRole.id, firstName, lastName, role);
      }
    } else {
      await updateUserProfileWithRole(userId, hrRole.id, firstName, lastName, role);
    }
  } catch (error) {
    console.log(`⚠️  Could not update profile for ${role}:`, error.message);
  }
}

async function updateUserProfileWithRole(userId, roleId, firstName, lastName, roleCode) {
  // Update or create user_profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      email: roleCode === 'hr_manager' ? 'hr@intimeesolutions.com' : 'employee@intimeesolutions.com',
      first_name: firstName,
      last_name: lastName,
      role: roleCode,
      is_active: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    });

  if (profileError) {
    console.log(`⚠️  Profile update error:`, profileError.message);
  }

  // Assign role
  const { error: roleError } = await supabase
    .from('user_roles')
    .upsert({
      user_id: userId,
      role_id: roleId,
      is_active: true,
      assigned_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,role_id'
    });

  if (roleError) {
    console.log(`⚠️  Role assignment error:`, roleError.message);
  }
}

// Run the script
createHRUsers();

