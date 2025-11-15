/**
 * Load Test Users Script
 * Runs the seed-test-users.sql via Supabase client
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// You'll need to provide these values
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.log('\nPlease set:');
  console.log('  NEXT_PUBLIC_SUPABASE_URL=your-url');
  console.log('  SUPABASE_SERVICE_ROLE_KEY=your-service-key');
  process.exit(1);
}

async function loadTestUsers() {
  console.log('🚀 Loading test users into database...\n');
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'seed-test-users.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('📄 SQL file loaded');
    console.log('📊 Executing SQL commands...\n');
    
    // Execute the SQL
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // Try alternative approach - execute via REST API
      console.log('⚠️  RPC method not available, trying direct approach...\n');
      
      // We'll need to use the Supabase dashboard for this
      console.log('📝 Please run the SQL manually:');
      console.log('   1. Go to: https://app.supabase.com');
      console.log('   2. Select your project');
      console.log('   3. Open SQL Editor');
      console.log('   4. Copy and paste: database/seed-test-users.sql');
      console.log('   5. Click "Run"\n');
      
      // Let's try a simpler approach - create a few test users directly
      console.log('💡 Alternative: Creating test users directly...\n');
      await createTestUsersDirectly(supabase);
      
    } else {
      console.log('✅ SQL executed successfully!');
      console.log(data);
    }
    
    // Verify users were created
    console.log('\n🔍 Verifying test users...\n');
    const { data: users, error: usersError } = await supabase
      .from('user_profiles')
      .select('email, role, full_name')
      .ilike('email', '%@intimeesolutions.com')
      .order('role');
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
    } else {
      console.log(`✅ Found ${users.length} test users:\n`);
      
      const byRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byRole).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
      
      console.log('\n📋 Sample users:');
      users.slice(0, 5).forEach(user => {
        console.log(`   - ${user.email} (${user.full_name}) - ${user.role}`);
      });
    }
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    console.log('\n💡 Manual Setup Required:');
    console.log('   Run database/seed-test-users.sql in Supabase SQL Editor');
  }
}

async function createTestUsersDirectly(supabase) {
  console.log('Creating test users via API...\n');
  
  const testUsers = [
    {
      email: 'admin@intimeesolutions.com',
      password: 'test12345',
      full_name: 'System Administrator',
      role: 'admin',
      department: 'Administration',
      phone: '+1-555-0100',
    },
    {
      email: 'recruiter.sarah@intimeesolutions.com',
      password: 'test12345',
      full_name: 'Sarah Johnson',
      role: 'recruiter',
      department: 'Recruiting',
      phone: '+1-555-0200',
    },
    {
      email: 'sales.david@intimeesolutions.com',
      password: 'test12345',
      full_name: 'David Martinez',
      role: 'sales',
      department: 'Sales',
      phone: '+1-555-0300',
    },
    {
      email: 'operations.maria@intimeesolutions.com',
      password: 'test12345',
      full_name: 'Maria Garcia',
      role: 'operations',
      department: 'Operations',
      phone: '+1-555-0500',
    },
    {
      email: 'employee.john@intimeesolutions.com',
      password: 'test12345',
      full_name: 'John Employee',
      role: 'employee',
      department: 'General',
      phone: '+1-555-0600',
    },
  ];
  
  for (const user of testUsers) {
    console.log(`Creating: ${user.email}...`);
    
    // Sign up the user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.full_name,
      },
    });
    
    if (authError) {
      console.log(`  ⚠️  ${authError.message}`);
      continue;
    }
    
    // Create user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: authData.user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        department: user.department,
        phone: user.phone,
        is_active: true,
      });
    
    if (profileError) {
      console.log(`  ⚠️  Profile error: ${profileError.message}`);
    } else {
      console.log(`  ✅ Created successfully`);
    }
  }
  
  console.log('\n✅ Test users created!\n');
}

// Run the script
loadTestUsers().then(() => {
  console.log('\n🎉 Done!\n');
  process.exit(0);
}).catch(err => {
  console.error('\n❌ Failed:', err);
  process.exit(1);
});

