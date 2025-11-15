#!/usr/bin/env node

/**
 * ============================================================================
 * CREATE TEST USER WITH ADMIN PERMISSIONS
 * ============================================================================
 * 
 * Creates user: su@intimeesolutions.com
 * Password: test12345
 * Role: Admin (full permissions)
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║         CREATE TEST USER WITH ADMIN PERMISSIONS            ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function createTestUser() {
  const email = 'su@intimeesolutions.com';
  const password = 'test12345';
  const fullName = 'Super User';

  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('👤 Name:', fullName);
  console.log('');

  try {
    // Step 1: Create auth user
    console.log('1️⃣  Creating auth user...');
    
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        full_name: fullName,
      }
    });

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('   ⚠️  User already exists, updating...\n');
        
        // Get existing user
        const { data: users } = await supabase.auth.admin.listUsers();
        const existingUser = users.users.find(u => u.email === email);
        
        if (existingUser) {
          // Update password
          await supabase.auth.admin.updateUserById(existingUser.id, {
            password: password,
            email_confirm: true,
            user_metadata: { full_name: fullName }
          });
          
          console.log('   ✅ Updated existing user\n');
          authData.user = existingUser;
        }
      } else {
        throw authError;
      }
    } else {
      console.log('   ✅ Auth user created\n');
    }

    const userId = authData.user.id;

    // Step 2: Create/update user profile
    console.log('2️⃣  Creating user profile...');
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: email,
        full_name: fullName,
        avatar_url: null,
        bio: 'Super User - Full Admin Access',
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (profileError) {
      console.log('   ⚠️  Profile error (may already exist):', profileError.message);
    } else {
      console.log('   ✅ User profile created\n');
    }

    // Step 3: Get admin role ID
    console.log('3️⃣  Assigning admin role...');
    
    const { data: adminRole, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('code', 'admin')
      .single();

    if (roleError || !adminRole) {
      console.log('   ⚠️  Admin role not found, checking available roles...');
      
      const { data: allRoles } = await supabase
        .from('roles')
        .select('*');
      
      console.log('   Available roles:', allRoles?.map(r => r.code).join(', ') || 'none');
      
      if (!adminRole) {
        console.log('   ⚠️  Creating admin role...');
        const { data: newRole, error: createRoleError } = await supabase
          .from('roles')
          .insert({
            code: 'admin',
            name: 'Administrator',
            description: 'Full system access',
          })
          .select()
          .single();
        
        if (createRoleError) {
          console.log('   ❌ Could not create admin role:', createRoleError.message);
        } else {
          adminRole.id = newRole.id;
          console.log('   ✅ Admin role created');
        }
      }
    }

    if (adminRole?.id) {
      // Assign admin role
      const { error: assignError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: userId,
          role_id: adminRole.id,
        }, {
          onConflict: 'user_id,role_id'
        });

      if (assignError) {
        console.log('   ⚠️  Role assignment error:', assignError.message);
      } else {
        console.log('   ✅ Admin role assigned\n');
      }
    }

    // Step 4: Create all other roles as well (for completeness)
    console.log('4️⃣  Assigning additional permissions...');
    
    const additionalRoles = ['student', 'employee', 'recruiter', 'sales', 'account_manager', 'operations'];
    
    for (const roleCode of additionalRoles) {
      const { data: role } = await supabase
        .from('roles')
        .select('id')
        .eq('code', roleCode)
        .single();
      
      if (role) {
        await supabase
          .from('user_roles')
          .upsert({
            user_id: userId,
            role_id: role.id,
          }, {
            onConflict: 'user_id,role_id',
            ignoreDuplicates: true
          });
        
        console.log(`   ✅ Assigned ${roleCode} role`);
      }
    }

    console.log('');

    // Step 5: Verify user
    console.log('5️⃣  Verifying user creation...');
    
    const { data: userData } = await supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles (
          roles (
            code,
            name
          )
        )
      `)
      .eq('id', userId)
      .single();

    if (userData) {
      console.log('   ✅ User verified!\n');
      console.log('╔════════════════════════════════════════════════════════════╗');
      console.log('║              ✅ USER CREATED SUCCESSFULLY!                 ║');
      console.log('╚════════════════════════════════════════════════════════════╝\n');
      
      console.log('📋 User Details:');
      console.log(`   ID: ${userData.id}`);
      console.log(`   Email: ${userData.email}`);
      console.log(`   Name: ${userData.full_name}`);
      console.log(`   Roles: ${userData.user_roles?.map(ur => ur.roles.name).join(', ') || 'None'}`);
      console.log('');
      
      console.log('🔑 Login Credentials:');
      console.log(`   Email: ${email}`);
      console.log(`   Password: ${password}`);
      console.log('');
      
      console.log('🚀 Next Steps:');
      console.log('   1. Go to http://localhost:3000/login');
      console.log(`   2. Login with: ${email}`);
      console.log(`   3. Password: ${password}`);
      console.log('   4. You now have full admin access!');
      console.log('');
      
      console.log('✅ All permissions granted!');
      console.log('');
    } else {
      console.log('   ⚠️  Could not verify user');
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

createTestUser();

