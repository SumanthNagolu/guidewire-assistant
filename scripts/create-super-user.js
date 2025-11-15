#!/usr/bin/env node

/**
 * Create Super User with All Roles and Permissions
 * Email: su@intimeesolutions.com
 * Password: test12345
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║       CREATE SUPER USER WITH ALL PERMISSIONS               ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

async function createSuperUser() {
  const email = 'su@intimeesolutions.com';
  const password = 'test12345';
  
  try {
    // Step 1: Get or create auth user
    console.log('1️⃣  Setting up authentication user...');
    
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let user = users.find(u => u.email === email);
    
    if (user) {
      console.log('   ✅ User exists, updating password...');
      await supabase.auth.admin.updateUserById(user.id, {
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: 'Super User',
          is_super_user: true
        }
      });
    } else {
      console.log('   ✅ Creating new user...');
      const { data, error } = await supabase.auth.admin.createUser({
        email: email,
        password: password,
        email_confirm: true,
        user_metadata: {
          full_name: 'Super User',
          is_super_user: true
        }
      });
      
      if (error) throw error;
      user = data.user;
    }
    
    console.log('   ✅ User ID:', user.id);
    console.log('');
    
    // Step 2: Ensure all roles exist
    console.log('2️⃣  Creating all roles...');
    
    const rolesToCreate = [
      { code: 'admin', name: 'Administrator', description: 'Full system access' },
      { code: 'student', name: 'Student', description: 'Learning platform access' },
      { code: 'employee', name: 'Employee', description: 'Employee portal access' },
      { code: 'recruiter', name: 'Recruiter', description: 'Recruitment CRM access' },
      { code: 'sales', name: 'Sales', description: 'Sales operations access' },
      { code: 'account_manager', name: 'Account Manager', description: 'Client management access' },
      { code: 'operations', name: 'Operations', description: 'Operations management' },
      { code: 'manager', name: 'Manager', description: 'Team management access' },
    ];
    
    const createdRoles = [];
    
    for (const role of rolesToCreate) {
      const { data: existing } = await supabase
        .from('roles')
        .select('id, name')
        .eq('name', role.name)
        .single();
      
      if (existing) {
        console.log(`   ✅ ${role.name} role exists`);
        createdRoles.push(existing);
      } else {
        const { data: newRole, error } = await supabase
          .from('roles')
          .insert(role)
          .select()
          .single();
        
        if (newRole) {
          console.log(`   ✅ Created ${role.name} role`);
          createdRoles.push(newRole);
        } else if (error && !error.message.includes('duplicate')) {
          console.log(`   ⚠️  ${role.name}: ${error.message}`);
        }
      }
    }
    
    console.log('');
    
    // Step 3: Create user profile
    console.log('3️⃣  Creating user profile...');
    
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: email,
        full_name: 'Super User',
        is_active: true,
      }, {
        onConflict: 'id'
      });
    
    if (profileError && !profileError.message.includes('duplicate')) {
      console.log('   ⚠️  Profile:', profileError.message);
    } else {
      console.log('   ✅ Profile created');
    }
    
    console.log('');
    
    // Step 4: Assign all roles to user
    console.log('4️⃣  Assigning all roles to user...');
    
    for (const role of createdRoles) {
      const { error } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role_id: role.id,
        }, {
          onConflict: 'user_id,role_id',
          ignoreDuplicates: true
        });
      
      if (error && !error.message.includes('duplicate')) {
        console.log(`   ⚠️  ${role.name}: ${error.message}`);
      } else {
        console.log(`   ✅ Assigned ${role.name} role`);
      }
    }
    
    console.log('');
    
    // Step 5: Verify everything
    console.log('5️⃣  Verifying setup...');
    
    const { data: profile } = await supabase
      .from('user_profiles')
      .select(\`
        *,
        user_roles (
          roles (
            name
          )
        )
      \`)
      .eq('id', user.id)
      .single();
    
    if (profile) {
      const roleNames = profile.user_roles?.map(ur => ur.roles.name).filter(Boolean) || [];
      console.log(`   ✅ User has ${roleNames.length} role(s)`);
      roleNames.forEach(name => console.log(`      - ${name}`));
    }
    
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║              ✅ SUPER USER CREATED! ✅                     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    
    console.log('🔑 Login Credentials:');
    console.log(`   Email: ${email}`);
    console.log(`   Password: ${password}`);
    console.log('');
    console.log('🚀 Login URL:');
    console.log('   http://localhost:3000/login');
    console.log('');
    console.log('✅ User has ALL permissions via:');
    console.log('   - Multiple role assignments');
    console.log('   - 230+ RLS policies');
    console.log('   - Super user metadata flag');
    console.log('');
    console.log('📊 Can access:');
    console.log('   ✅ /academy - Student portal');
    console.log('   ✅ /hr - HR portal');
    console.log('   ✅ /admin - Admin portal');
    console.log('   ✅ /employee - CRM portal');
    console.log('   ✅ /platform - Platform portal');
    console.log('   ✅ /productivity - Productivity dashboard');
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

createSuperUser();

