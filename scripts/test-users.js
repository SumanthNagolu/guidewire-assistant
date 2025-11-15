#!/usr/bin/env node

/**
 * Test User Setup Script
 * 
 * This script helps you:
 * 1. Verify test users exist
 * 2. Test login for each role
 * 3. Generate test data
 * 4. Clean up test data
 */

import { 
  verifyTestUsers,
  loginAsTestUser,
  generateTestDataForRole,
  cleanupTestData,
  deleteAllTestUsers,
  printTestUserSummary,
  TEST_USERS,
  getRandomTestUser,
} from './lib/test-users';

// Load environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  console.log('\n🧪 IntimeSolutions Test User Management\n');

  switch (command) {
    case 'verify':
      await verifyCommand();
      break;
    
    case 'test-login':
      await testLoginCommand(args[1]);
      break;
    
    case 'generate-data':
      await generateDataCommand(args[1]);
      break;
    
    case 'cleanup':
      await cleanupCommand();
      break;
    
    case 'delete-all':
      await deleteAllCommand();
      break;
    
    case 'list':
      printTestUserSummary();
      break;
    
    case 'help':
    default:
      printHelp();
      break;
  }
}

function printHelp() {
  console.log('Usage: node scripts/test-users.js [command] [options]\n');
  console.log('Commands:');
  console.log('  verify              - Check if test users exist in database');
  console.log('  test-login [role]   - Test login for a specific role');
  console.log('  generate-data [role] - Generate test data for a role');
  console.log('  cleanup             - Remove all test data (keeps users)');
  console.log('  delete-all          - Delete all test users and data (⚠️  DESTRUCTIVE)');
  console.log('  list                - List all test users');
  console.log('  help                - Show this help message\n');
  console.log('Examples:');
  console.log('  node scripts/test-users.js verify');
  console.log('  node scripts/test-users.js test-login recruiter');
  console.log('  node scripts/test-users.js generate-data sales');
  console.log('  node scripts/test-users.js list\n');
}

async function verifyCommand() {
  console.log('🔍 Verifying test users...\n');
  
  const result = await verifyTestUsers(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  if (result.success) {
    console.log('✅ All test users exist!');
    console.log(`   Total: ${result.total}`);
    console.log(`   Existing: ${result.existing}`);
    
    if (result.users) {
      console.log('\n📊 Users by role:');
      const byRole = result.users.reduce((acc: any, user: any) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byRole).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
    }
  } else {
    console.log('❌ Some test users are missing!');
    console.log(`   Total expected: ${result.total}`);
    console.log(`   Found: ${result.existing}`);
    console.log(`   Missing: ${result.missing.length}`);
    
    if (result.missing.length > 0) {
      console.log('\n📝 Missing users:');
      result.missing.forEach((email: string) => {
        console.log(`   - ${email}`);
      });
      console.log('\nRun the seed-test-users.sql script to create them.');
    }
  }
  console.log();
}

async function testLoginCommand(role?: string) {
  if (!role) {
    console.log('❌ Please specify a role');
    console.log('   Available roles: admin, recruiter, sales, account_manager, operations, employee, student\n');
    return;
  }
  
  const roleKey = role as keyof typeof TEST_USERS;
  
  if (!TEST_USERS[roleKey]) {
    console.log(`❌ Invalid role: ${role}\n`);
    return;
  }
  
  const user = getRandomTestUser(roleKey);
  
  console.log(`🔐 Testing login for ${role}...`);
  console.log(`   User: ${user.email}\n`);
  
  const result = await loginAsTestUser(SUPABASE_URL, SUPABASE_ANON_KEY, user.email);
  
  if (result.success) {
    console.log('✅ Login successful!');
    console.log(`   User ID: ${result.user.id}`);
    console.log(`   Email: ${result.user.email}`);
    console.log(`   Role: ${result.profile?.role}`);
    console.log(`   Name: ${result.profile?.full_name}`);
    console.log(`   Active: ${result.profile?.is_active}`);
  } else {
    console.log('❌ Login failed!');
    console.log(`   Error: ${result.error?.message}`);
  }
  console.log();
}

async function generateDataCommand(role?: string) {
  if (!role) {
    console.log('❌ Please specify a role');
    console.log('   Available roles: recruiter, sales, account_manager, operations\n');
    return;
  }
  
  const roleKey = role as keyof typeof TEST_USERS;
  
  if (!TEST_USERS[roleKey]) {
    console.log(`❌ Invalid role: ${role}\n`);
    return;
  }
  
  const user = getRandomTestUser(roleKey);
  
  console.log(`📊 Generating test data for ${role}...`);
  console.log(`   User: ${user.email}\n`);
  
  // First login to get user ID
  const loginResult = await loginAsTestUser(SUPABASE_URL, SUPABASE_ANON_KEY, user.email);
  
  if (!loginResult.success) {
    console.log('❌ Failed to login user');
    return;
  }
  
  const result = await generateTestDataForRole(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    roleKey,
    loginResult.user.id
  );
  
  if (result.success) {
    console.log('✅ Test data generated!');
    if (result.count) {
      console.log(`   Records created: ${result.count}`);
    }
    if (result.message) {
      console.log(`   ${result.message}`);
    }
  } else {
    console.log('❌ Failed to generate test data');
    console.log(`   Error: ${result.error?.message}`);
  }
  console.log();
}

async function cleanupCommand() {
  console.log('🧹 Cleaning up test data...\n');
  console.log('⚠️  This will delete all test data but keep the users.\n');
  
  const result = await cleanupTestData(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  if (result.success) {
    console.log('✅ Cleanup complete!');
    console.log('\n📊 Results by table:');
    Object.entries(result.results).forEach(([table, status]: [string, any]) => {
      const icon = status.success ? '✅' : '❌';
      console.log(`   ${icon} ${table}`);
    });
  } else {
    console.log('❌ Cleanup failed');
    console.log(`   Error: ${result.error?.message}`);
  }
  console.log();
}

async function deleteAllCommand() {
  console.log('⚠️  WARNING: This will delete ALL test users and their data!\n');
  console.log('This action cannot be undone.\n');
  
  // In a real script, you'd want to add a confirmation prompt
  console.log('❌ Aborted. This is a destructive operation.');
  console.log('   To proceed, uncomment the deletion code in the script.\n');
  
  // Uncomment below to enable deletion
  /*
  const result = await deleteAllTestUsers(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  if (result.success) {
    console.log('✅ All test users deleted!');
    console.log(`   ${result.message}`);
  } else {
    console.log('❌ Deletion failed');
    console.log(`   Error: ${result.error?.message}`);
  }
  console.log();
  */
}

// Run the script
main().catch(console.error);

