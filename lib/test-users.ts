/**
 * Test User Management Utility
 * 
 * Provides functions to:
 * - Verify test users exist
 * - Login as test users
 * - Generate test data for each role
 * - Clean up test data
 */

import { createClient } from '@supabase/supabase-js';

// Test user credentials
export const TEST_USERS = {
  admin: [
    { email: 'admin@intimeesolutions.com', name: 'System Administrator', role: 'admin' },
    { email: 'admin.john@intimeesolutions.com', name: 'John Admin', role: 'admin' },
  ],
  recruiter: [
    { email: 'recruiter.sarah@intimeesolutions.com', name: 'Sarah Johnson', role: 'recruiter' },
    { email: 'recruiter.mike@intimeesolutions.com', name: 'Mike Chen', role: 'recruiter' },
    { email: 'recruiter.senior@intimeesolutions.com', name: 'Senior Recruiter', role: 'recruiter' },
    { email: 'recruiter.junior@intimeesolutions.com', name: 'Junior Recruiter', role: 'recruiter' },
    { email: 'manager.team@intimeesolutions.com', name: 'Team Manager', role: 'recruiter' },
  ],
  sales: [
    { email: 'sales.david@intimeesolutions.com', name: 'David Martinez', role: 'sales' },
    { email: 'sales.lisa@intimeesolutions.com', name: 'Lisa Anderson', role: 'sales' },
    { email: 'sales.rep@intimeesolutions.com', name: 'Sales Representative', role: 'sales' },
  ],
  account_manager: [
    { email: 'accountmgr.jennifer@intimeesolutions.com', name: 'Jennifer Wilson', role: 'account_manager' },
    { email: 'accountmgr.robert@intimeesolutions.com', name: 'Robert Taylor', role: 'account_manager' },
    { email: 'accountmgr.senior@intimeesolutions.com', name: 'Senior Account Manager', role: 'account_manager' },
  ],
  operations: [
    { email: 'operations.maria@intimeesolutions.com', name: 'Maria Garcia', role: 'operations' },
    { email: 'operations.james@intimeesolutions.com', name: 'James Brown', role: 'operations' },
    { email: 'operations.coordinator@intimeesolutions.com', name: 'Operations Coordinator', role: 'operations' },
  ],
  employee: [
    { email: 'employee.john@intimeesolutions.com', name: 'John Employee', role: 'employee' },
    { email: 'employee.jane@intimeesolutions.com', name: 'Jane Employee', role: 'employee' },
    { email: 'employee.consultant@intimeesolutions.com', name: 'Consultant Employee', role: 'employee' },
  ],
  student: [
    { email: 'student.amy@intimeesolutions.com', name: 'Amy Student', role: 'student' },
    { email: 'student.bob@intimeesolutions.com', name: 'Bob Student', role: 'student' },
    { email: 'student.beginner@intimeesolutions.com', name: 'Beginner Student', role: 'student' },
    { email: 'student.advanced@intimeesolutions.com', name: 'Advanced Student', role: 'student' },
  ],
  special: [
    { email: 'inactive.user@intimeesolutions.com', name: 'Inactive User', role: 'employee', status: 'inactive' },
    { email: 'pending.user@intimeesolutions.com', name: 'Pending User', role: 'employee', status: 'pending' },
  ],
} as const;

export const TEST_PASSWORD = 'test12345';

/**
 * Get all test user emails
 */
export function getAllTestUserEmails(): string[] {
  return Object.values(TEST_USERS)
    .flat()
    .map(user => user.email);
}

/**
 * Get test users by role
 */
export function getTestUsersByRole(role: keyof typeof TEST_USERS) {
  return TEST_USERS[role];
}

/**
 * Get a random test user by role
 */
export function getRandomTestUser(role: keyof typeof TEST_USERS) {
  const users = TEST_USERS[role];
  return users[Math.floor(Math.random() * users.length)];
}

/**
 * Verify test users exist in database
 */
export async function verifyTestUsers(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const allEmails = getAllTestUserEmails();
  
  const { data, error } = await supabase
    .from('user_profiles')
    .select('email, role, is_active')
    .in('email', allEmails);
  
  if (error) {
    console.error('Error verifying test users:', error);
    return { success: false, error };
  }
  
  const existingEmails = new Set(data?.map(u => u.email) || []);
  const missingUsers = allEmails.filter(email => !existingEmails.has(email));
  
  return {
    success: missingUsers.length === 0,
    total: allEmails.length,
    existing: data?.length || 0,
    missing: missingUsers,
    users: data,
  };
}

/**
 * Login as a test user
 */
export async function loginAsTestUser(
  supabaseUrl: string,
  supabaseKey: string,
  email: string,
  password: string = TEST_PASSWORD
) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    console.error(`Failed to login as ${email}:`, error.message);
    return { success: false, error };
  }
  
  // Get user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();
  
  return {
    success: true,
    user: data.user,
    session: data.session,
    profile,
  };
}

/**
 * Generate test data for a specific role
 */
export async function generateTestDataForRole(
  supabaseUrl: string,
  supabaseKey: string,
  role: keyof typeof TEST_USERS,
  userId: string
) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  switch (role) {
    case 'recruiter':
      return await generateRecruiterTestData(supabase, userId);
    case 'sales':
      return await generateSalesTestData(supabase, userId);
    case 'account_manager':
      return await generateAccountManagerTestData(supabase, userId);
    case 'operations':
      return await generateOperationsTestData(supabase, userId);
    default:
      return { success: true, message: 'No test data needed for this role' };
  }
}

/**
 * Generate test candidates for recruiters
 */
async function generateRecruiterTestData(supabase: any, userId: string) {
  const testCandidates = [
    {
      first_name: 'Alice',
      last_name: 'Johnson',
      email: 'alice.johnson.test@example.com',
      phone: '+1-555-1001',
      location: 'New York, NY',
      current_title: 'Senior Software Engineer',
      years_of_experience: 8,
      skills: ['Java', 'Python', 'AWS', 'Kubernetes'],
      availability: 'immediate',
      work_authorization: 'us_citizen',
      status: 'active',
      owner_id: userId,
    },
    {
      first_name: 'Bob',
      last_name: 'Smith',
      email: 'bob.smith.test@example.com',
      phone: '+1-555-1002',
      location: 'San Francisco, CA',
      current_title: 'DevOps Engineer',
      years_of_experience: 5,
      skills: ['Docker', 'Jenkins', 'Terraform', 'AWS'],
      availability: 'within_2_weeks',
      work_authorization: 'green_card',
      status: 'active',
      owner_id: userId,
    },
    {
      first_name: 'Carol',
      last_name: 'Williams',
      email: 'carol.williams.test@example.com',
      phone: '+1-555-1003',
      location: 'Austin, TX',
      current_title: 'Full Stack Developer',
      years_of_experience: 6,
      skills: ['React', 'Node.js', 'PostgreSQL', 'TypeScript'],
      availability: 'within_1_month',
      work_authorization: 'h1b',
      status: 'active',
      owner_id: userId,
    },
  ];
  
  const { data, error } = await supabase
    .from('candidates')
    .insert(testCandidates)
    .select();
  
  if (error) {
    console.error('Error creating test candidates:', error);
    return { success: false, error };
  }
  
  return {
    success: true,
    candidates: data,
    count: data?.length || 0,
  };
}

/**
 * Generate test clients for sales
 */
async function generateSalesTestData(supabase: any, userId: string) {
  const testClients = [
    {
      name: 'Tech Corp Inc',
      legal_name: 'Tech Corporation Incorporated',
      website: 'https://techcorp.example.com',
      industry: 'Technology',
      company_size: '201-500',
      city: 'San Francisco',
      state: 'CA',
      status: 'active',
      tier: 'tier_1',
      sales_rep_id: userId,
    },
    {
      name: 'Finance Solutions LLC',
      legal_name: 'Finance Solutions Limited Liability Company',
      website: 'https://financesolutions.example.com',
      industry: 'Financial Services',
      company_size: '51-200',
      city: 'New York',
      state: 'NY',
      status: 'active',
      tier: 'tier_2',
      sales_rep_id: userId,
    },
    {
      name: 'Healthcare Systems',
      legal_name: 'Healthcare Systems Corporation',
      website: 'https://healthcaresys.example.com',
      industry: 'Healthcare',
      company_size: '501-1000',
      city: 'Boston',
      state: 'MA',
      status: 'prospect',
      tier: 'tier_2',
      sales_rep_id: userId,
    },
  ];
  
  const { data, error } = await supabase
    .from('clients')
    .insert(testClients)
    .select();
  
  if (error) {
    console.error('Error creating test clients:', error);
    return { success: false, error };
  }
  
  return {
    success: true,
    clients: data,
    count: data?.length || 0,
  };
}

/**
 * Generate test data for account managers
 */
async function generateAccountManagerTestData(supabase: any, userId: string) {
  // Account managers typically work with existing clients
  // We'll create opportunities for them
  
  // First, get some clients
  const { data: clients } = await supabase
    .from('clients')
    .select('id')
    .limit(3);
  
  if (!clients || clients.length === 0) {
    return { 
      success: false, 
      message: 'No clients found. Create clients first.' 
    };
  }
  
  const testOpportunities = clients.map((client, idx) => ({
    client_id: client.id,
    name: `Q${Math.floor(Math.random() * 4) + 1} Staffing Opportunity`,
    description: 'Potential staffing engagement',
    stage: ['lead', 'qualified', 'proposal'][idx % 3],
    estimated_value: (50000 + Math.random() * 150000),
    probability: 50 + Math.floor(Math.random() * 40),
    owner_id: userId,
  }));
  
  const { data, error } = await supabase
    .from('opportunities')
    .insert(testOpportunities)
    .select();
  
  if (error) {
    console.error('Error creating test opportunities:', error);
    return { success: false, error };
  }
  
  return {
    success: true,
    opportunities: data,
    count: data?.length || 0,
  };
}

/**
 * Generate test data for operations
 */
async function generateOperationsTestData(supabase: any, userId: string) {
  // Operations typically work with existing placements
  return { 
    success: true, 
    message: 'Operations users work with existing placements. Create placements first.' 
  };
}

/**
 * Clean up test data
 */
export async function cleanupTestData(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const allEmails = getAllTestUserEmails();
  
  // Get test user IDs
  const { data: users } = await supabase
    .from('user_profiles')
    .select('id')
    .in('email', allEmails);
  
  if (!users) return { success: false, error: 'No test users found' };
  
  const userIds = users.map(u => u.id);
  
  // Delete test data (in order of dependencies)
  const tables = [
    'interviews',
    'applications',
    'placements',
    'timesheets',
    'opportunities',
    'activities',
    'contacts',
    'jobs',
    'candidates',
    'clients',
    'contracts',
  ];
  
  const results: any = {};
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .in('owner_id', userIds);
    
    results[table] = error ? { success: false, error } : { success: true };
  }
  
  return {
    success: true,
    results,
  };
}

/**
 * Delete all test users (WARNING: Destructive)
 */
export async function deleteAllTestUsers(supabaseUrl: string, supabaseKey: string) {
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  const allEmails = getAllTestUserEmails();
  
  // First clean up all related data
  await cleanupTestData(supabaseUrl, supabaseKey);
  
  // Delete user profiles
  const { error: profileError } = await supabase
    .from('user_profiles')
    .delete()
    .in('email', allEmails);
  
  if (profileError) {
    console.error('Error deleting user profiles:', profileError);
    return { success: false, error: profileError };
  }
  
  // Note: auth.users will be cascade deleted via FK constraint
  
  return {
    success: true,
    message: `Deleted ${allEmails.length} test users and their data`,
  };
}

/**
 * Print test user summary
 */
export function printTestUserSummary() {
  console.log('\n📋 Test User Summary\n');
  console.log('Password for all users: test12345\n');
  
  Object.entries(TEST_USERS).forEach(([role, users]) => {
    console.log(`\n${role.toUpperCase()} (${users.length} users):`);
    users.forEach(user => {
      console.log(`  - ${user.email} (${user.name})`);
    });
  });
  
  console.log(`\nTotal: ${getAllTestUserEmails().length} test users\n`);
}

