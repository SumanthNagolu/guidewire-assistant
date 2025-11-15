const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Database connection string 
const connectionString = 'postgresql://postgres.jbusreaeuxzpjszuhvre:Sumanthlucky$24@aws-0-us-west-1.pooler.supabase.com:6543/postgres';

async function runMigration() {
  const client = new Client({
    connectionString: connectionString,
  });

  try {
    console.log('🚀 Connecting to database...');
    await client.connect();
    
    console.log('📊 Reading migration file...');
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250113_trikala_workflow_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🏃 Running migration...');
    await client.query(migrationSQL);
    
    console.log('✅ Migration completed successfully!');
    console.log('');
    console.log('📝 Next steps:');
    console.log('1. Visit http://localhost:3000/platform');
    console.log('2. Create your first pod and assign team members');
    console.log('3. Start creating workflows for your operations');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await client.end();
  }
}

runMigration();

