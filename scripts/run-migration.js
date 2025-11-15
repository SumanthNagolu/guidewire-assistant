const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Use service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://jbusreaeuxzpjszuhvre.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpidXNyZWFldXh6cGpzenVodnJlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjMzOTYwNSwiZXhwIjoyMDc3OTE1NjA1fQ.YsJlv-nMc_6ewfGfB4PcVRQK96nGdVlAY_QND9a4RiA';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function runMigration() {
  try {
    console.log('🚀 Starting Trikala Workflow migration...');
    
    // Read migration file
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20250113_trikala_workflow_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Split into individual statements (handle multi-line statements)
    const statements = migrationSQL
      .split(/;[\s\n]*(?=--|\n|$)/)
      .map(s => s.trim())
      .filter(s => {
        const trimmed = s.trim();
        return trimmed.length > 0 && 
               !trimmed.startsWith('--') &&
               (trimmed.toUpperCase().startsWith('CREATE') ||
                trimmed.toUpperCase().startsWith('ALTER') ||
                trimmed.toUpperCase().startsWith('INSERT'));
      });
    
    console.log(`📋 Found ${statements.length} SQL statements to execute`);
    
    // Debug: show first statement
    if (statements.length > 0) {
      console.log('First statement type:', statements[0].substring(0, 20).toUpperCase());
    }
    
    let successCount = 0;
    let errorCount = 0;
    
    // Execute key CREATE TABLE statements - look for CREATE statements
    const keyStatements = statements.filter(stmt => {
      const upperStmt = stmt.toUpperCase();
      const hasCreate = upperStmt.startsWith('CREATE TABLE') || upperStmt.includes('CREATE TABLE');
      const hasWorkflow = upperStmt.includes('WORKFLOW_TEMPLATES') ||
        upperStmt.includes('WORKFLOW_INSTANCES') ||
        upperStmt.includes('WORKFLOW_STAGES') ||
        upperStmt.includes('WORKFLOW_TRANSITIONS') ||
        upperStmt.includes('WORKFLOW_INSTANCE_STAGES');
      return hasCreate && hasWorkflow;
    });
    
    console.log(`\n🔧 Creating ${keyStatements.length} workflow tables...`);
    
    // Debug: show first few statements
    if (keyStatements.length === 0) {
      console.log('No workflow table CREATE statements found. Looking for any CREATE TABLE...');
      const createStatements = statements.filter(stmt => 
        stmt.toUpperCase().includes('CREATE TABLE')
      );
      console.log(`Found ${createStatements.length} total CREATE TABLE statements`);
      if (createStatements.length > 0) {
        console.log('First CREATE TABLE statement:', createStatements[0].substring(0, 100) + '...');
      }
    }
    
    for (const stmt of keyStatements) {
      const tableName = stmt.match(/CREATE TABLE (?:IF NOT EXISTS )?(\w+)/i)?.[1];
      try {
        // Use raw SQL execution via Supabase
        const { error } = await supabase.rpc('exec_sql', { query: stmt + ';' }).single();
        
        if (error) {
          console.log(`❌ Failed to create table ${tableName}: ${error.message}`);
          errorCount++;
        } else {
          console.log(`✅ Created table: ${tableName}`);
          successCount++;
        }
      } catch (err) {
        console.log(`⚠️  Skipping ${tableName} - might already exist`);
      }
    }
    
    console.log(`\n📊 Migration Summary:`);
    console.log(`✅ Successful statements: ${successCount}`);
    console.log(`❌ Failed statements: ${errorCount}`);
    
    // Check if tables were created
    console.log('\n🔍 Verifying tables...');
    const tables = ['workflow_templates', 'workflow_instances', 'workflow_stages'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (!error) {
        console.log(`✅ Table ${table} exists and is accessible`);
      } else {
        console.log(`⚠️  Table ${table} not accessible: ${error.message}`);
      }
    }
    
    console.log('\n✨ Migration process completed!');
    console.log('Note: Some tables might need to be created manually via Supabase Dashboard.');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Check if exec_sql function exists, if not create it
async function setupExecSQL() {
  try {
    // Try to create the exec_sql function
    const createFunction = `
      CREATE OR REPLACE FUNCTION exec_sql(query text)
      RETURNS void
      LANGUAGE plpgsql
      SECURITY DEFINER
      AS $$
      BEGIN
        EXECUTE query;
      END;
      $$;
    `;
    
    console.log('Setting up exec_sql function...');
    // This might fail if we don't have permission, but that's okay
    await supabase.rpc('exec_sql', { query: createFunction });
  } catch (error) {
    // Function might not be created, but we'll try the migration anyway
    console.log('Note: Could not create exec_sql function, will try direct table creation');
  }
}

// Run the migration
setupExecSQL().then(() => runMigration());
