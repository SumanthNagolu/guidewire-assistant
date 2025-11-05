#!/usr/bin/env tsx

/**
 * Verification script to check if database is ready for topic seeding
 * 
 * Checks:
 * 1. Environment variables are set
 * 2. Products table exists and has ClaimCenter product
 * 3. Reminder tables exist (learner_reminder_settings, learner_reminder_logs)
 * 4. Topics table is ready
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const main = async () => {
  console.log('🔍 Verifying database setup for Sprint 3...\n');

  // Check 1: Environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing Supabase credentials.');
    console.error('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exitCode = 1;
    return;
  }

  console.log('✅ Environment variables configured');

  const supabase = createClient<Database>(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Check 2: Products table
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('code, name')
    .eq('code', 'CC');

  if (productsError) {
    console.error('❌ Failed to query products table:', productsError.message);
    process.exitCode = 1;
    return;
  }

  if (!products || products.length === 0) {
    console.error('❌ ClaimCenter product (code: CC) not found in products table.');
    console.error('   Run the database schema.sql first to seed products.');
    process.exitCode = 1;
    return;
  }

  console.log(`✅ Products table ready (found: ${products[0].name})`);

  // Check 3: Reminder tables
  const { error: reminderSettingsError } = await supabase
    .from('learner_reminder_settings')
    .select('user_id')
    .limit(1);

  if (reminderSettingsError) {
    console.error('❌ learner_reminder_settings table missing:', reminderSettingsError.message);
    console.error('   Run the updated schema.sql to create reminder tables.');
    process.exitCode = 1;
    return;
  }

  const { error: reminderLogsError } = await supabase
    .from('learner_reminder_logs')
    .select('id')
    .limit(1);

  if (reminderLogsError) {
    console.error('❌ learner_reminder_logs table missing:', reminderLogsError.message);
    console.error('   Run the updated schema.sql to create reminder tables.');
    process.exitCode = 1;
    return;
  }

  console.log('✅ Reminder tables exist');

  // Check 4: Topics table
  const { data: existingTopics, error: topicsError } = await supabase
    .from('topics')
    .select('id, title')
    .eq('product_id', products[0].id as string)
    .order('position', { ascending: true });

  if (topicsError) {
    console.error('❌ Failed to query topics table:', topicsError.message);
    process.exitCode = 1;
    return;
  }

  if (!existingTopics || existingTopics.length === 0) {
    console.log('⚠️  No ClaimCenter topics found in database (ready to seed)');
  } else {
    console.log(`⚠️  Found ${existingTopics.length} existing ClaimCenter topics`);
    console.log(`   First topic: "${existingTopics[0].title}"`);
    console.log('   Seeding will update/upsert based on topic IDs.');
  }

  console.log('\n✅ Database is ready for topic seeding!');
  console.log('\nNext steps:');
  console.log('  1. Review data/claimcenter-topics.json');
  console.log('  2. Run: npm run seed:claimcenter');
  console.log('  3. Verify in Supabase dashboard or run this script again\n');
};

await main();

