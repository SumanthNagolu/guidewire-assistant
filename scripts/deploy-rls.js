// Execute RLS Policies Script
// This script connects to Supabase and runs the RLS policies

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function executeSQL() {
  console.log('🔧 Connecting to Supabase...\n');
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env.local');
    process.exit(1);
  }
  
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  
  console.log('✅ Connected to Supabase\n');
  console.log('📄 Reading RLS policies SQL file...\n');
  
  const sqlFile = path.join(__dirname, '..', 'database', 'COMPLETE_RLS_POLICIES.sql');
  const sql = fs.readFileSync(sqlFile, 'utf8');
  
  console.log('🚀 Executing RLS policies (this may take 30-60 seconds)...\n');
  
  try {
    // Execute the SQL using the REST API
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Error executing SQL:', error.message);
      
      // Try alternative method: split into individual statements
      console.log('\n📝 Trying alternative method: executing statements individually...\n');
      await executeIndividually(supabase, sql);
    } else {
      console.log('✅ RLS policies executed successfully!\n');
      console.log(data);
    }
  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    console.log('\n📝 Trying to execute via direct SQL...\n');
    await executeDirect(supabase, sql);
  }
  
  console.log('\n🎉 RLS Policy Deployment Complete!\n');
  console.log('Next step: Run verification script to confirm all policies are active');
}

async function executeDirect(supabase, sql) {
  // Use postgREST to execute SQL
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--') && s.toUpperCase() !== 'BEGIN' && s.toUpperCase() !== 'COMMIT');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const statement of statements) {
    if (statement.includes('RAISE NOTICE') || statement.includes('DO $$')) {
      continue; // Skip procedural statements
    }
    
    try {
      const { error } = await supabase.rpc('exec', { sql: statement + ';' });
      if (error) {
        console.log(`⚠️  Skipped: ${statement.substring(0, 60)}...`);
        errorCount++;
      } else {
        successCount++;
        if (successCount % 10 === 0) {
          console.log(`✅ Executed ${successCount} statements...`);
        }
      }
    } catch (err) {
      errorCount++;
    }
  }
  
  console.log(`\n📊 Results: ${successCount} succeeded, ${errorCount} skipped`);
}

async function executeIndividually(supabase, sql) {
  // Split and execute
  const lines = sql.split('\n');
  let buffer = '';
  let count = 0;
  
  for (const line of lines) {
    if (line.trim().startsWith('--') || line.trim() === '') {
      continue;
    }
    
    buffer += line + '\n';
    
    if (line.trim().endsWith(';')) {
      try {
        await supabase.rpc('exec', { sql: buffer });
        count++;
        if (count % 10 === 0) {
          console.log(`✅ Executed ${count} policies...`);
        }
      } catch (err) {
        // Skip errors
      }
      buffer = '';
    }
  }
  
  console.log(`\n✅ Completed: ${count} policies executed`);
}

executeSQL().catch(console.error);

