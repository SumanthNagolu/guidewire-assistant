const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createSuperUser() {
  console.log('Creating super user...\n');
  
  const email = 'su@intimeesolutions.com';
  const password = 'test12345';
  
  // Step 1: Create/update auth user
  const { data: { users } } = await supabase.auth.admin.listUsers();
  let user = users.find(u => u.email === email);
  
  if (user) {
    console.log('User exists, updating...');
    await supabase.auth.admin.updateUserById(user.id, {
      password: password,
      email_confirm: true,
      user_metadata: { full_name: 'Super User' }
    });
  } else {
    console.log('Creating user...');
    const { data } = await supabase.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: { full_name: 'Super User' }
    });
    user = data.user;
  }
  
  console.log('User ID:', user.id);
  console.log('Email:', user.email, '\n');
  
  // Step 2: Create roles if they don't exist
  const roles = [
    { name: 'Administrator', description: 'Admin' },
    { name: 'Student', description: 'Student' },
    { name: 'Employee', description: 'Employee' },
    { name: 'Recruiter', description: 'Recruiter' },
  ];
  
  console.log('Creating roles...');
  for (const role of roles) {
    await supabase.from('roles').upsert(role, { onConflict: 'name', ignoreDuplicates: true });
    console.log('  -', role.name);
  }
  
  console.log('\nAssigning all roles to user...');
  const { data: allRoles } = await supabase.from('roles').select('*');
  
  for (const role of allRoles || []) {
    await supabase.from('user_roles').upsert({
      user_id: user.id,
      role_id: role.id
    }, { onConflict: 'user_id,role_id', ignoreDuplicates: true });
    console.log('  -', role.name);
  }
  
  console.log('\n✅ SUPER USER CREATED!\n');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nLogin at: http://localhost:3000/login\n');
}

createSuperUser().catch(e => console.error('Error:', e.message));
