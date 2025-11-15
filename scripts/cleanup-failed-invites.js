#!/usr/bin/env node

/**
 * Cleanup Failed User Invites
 * 
 * This script cleans up failed user invites from Supabase
 * that were created due to SMTP/rate limit issues.
 * 
 * Usage: node scripts/cleanup-failed-invites.js [email]
 */

// Try to load .env.local if dotenv is available
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // dotenv not available, rely on environment variables
}

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function cleanupFailedInvites(specificEmail = null) {
  console.log('\n🧹 Cleaning Up Failed User Invites\n');
  console.log('=' .repeat(50));
  
  try {
    // Step 1: List unconfirmed users
    console.log('\n1️⃣  Finding unconfirmed users...');
    
    let query = supabase.auth.admin.listUsers();
    
    const { data: users, error: listError } = await query;
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }
    
    const unconfirmedUsers = users.users.filter(user => 
      !user.email_confirmed_at && 
      (!specificEmail || user.email === specificEmail)
    );
    
    if (unconfirmedUsers.length === 0) {
      console.log('✅ No unconfirmed users found!');
      return;
    }
    
    console.log(`\n📋 Found ${unconfirmedUsers.length} unconfirmed user(s):\n`);
    
    unconfirmedUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${new Date(user.created_at).toLocaleString()}`);
      console.log('');
    });
    
    // Step 2: Confirm deletion
    const readline = require('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    const answer = await new Promise((resolve) => {
      rl.question(`\n⚠️  Delete these ${unconfirmedUsers.length} user(s)? (yes/no): `, resolve);
    });
    
    rl.close();
    
    if (answer.toLowerCase() !== 'yes') {
      console.log('\n⏸️  Cancelled. No users deleted.');
      return;
    }
    
    // Step 3: Delete users
    console.log('\n2️⃣  Deleting users...');
    
    let deletedCount = 0;
    let errorCount = 0;
    
    for (const user of unconfirmedUsers) {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (deleteError) {
        console.log(`❌ Failed to delete ${user.email}: ${deleteError.message}`);
        errorCount++;
      } else {
        console.log(`✅ Deleted ${user.email}`);
        deletedCount++;
      }
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log(`\n✅ Cleanup Complete!`);
    console.log(`   Deleted: ${deletedCount}`);
    console.log(`   Errors: ${errorCount}`);
    
  } catch (err) {
    console.error('\n❌ Cleanup failed:', err.message);
  }
}

const specificEmail = process.argv[2];
cleanupFailedInvites(specificEmail).catch(console.error);

