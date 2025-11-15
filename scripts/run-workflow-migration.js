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

// Key workflow tables to create
const workflowTables = [
  {
    name: 'workflow_templates',
    sql: `
      CREATE TABLE IF NOT EXISTS workflow_templates (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        description TEXT,
        category TEXT CHECK (category IN ('recruiting', 'bench_sales', 'training', 'sales', 'talent_acquisition', 'custom')),
        stages JSONB NOT NULL DEFAULT '[]'::jsonb,
        transitions JSONB NOT NULL DEFAULT '[]'::jsonb,
        designer_data JSONB DEFAULT '{}'::jsonb,
        is_active BOOLEAN DEFAULT TRUE,
        is_system BOOLEAN DEFAULT FALSE,
        version INTEGER DEFAULT 1,
        created_by UUID REFERENCES auth.users(id),
        pod_id UUID REFERENCES pods(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  },
  {
    name: 'workflow_instances',
    sql: `
      CREATE TABLE IF NOT EXISTS workflow_instances (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        template_id UUID REFERENCES workflow_templates(id),
        name TEXT NOT NULL,
        description TEXT,
        status TEXT CHECK (status IN ('active', 'completed', 'cancelled', 'paused')) DEFAULT 'active',
        current_stage TEXT,
        pod_id UUID REFERENCES pods(id),
        job_id UUID REFERENCES jobs(id),
        candidate_id UUID REFERENCES candidates(id),
        instance_type TEXT CHECK (instance_type IN ('job', 'candidate', 'training', 'custom')),
        data JSONB DEFAULT '{}'::jsonb,
        started_at TIMESTAMPTZ DEFAULT NOW(),
        completed_at TIMESTAMPTZ,
        created_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  },
  {
    name: 'workflow_stage_history',
    sql: `
      CREATE TABLE IF NOT EXISTS workflow_stage_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        instance_id UUID REFERENCES workflow_instances(id) ON DELETE CASCADE,
        stage_name TEXT NOT NULL,
        entered_at TIMESTAMPTZ DEFAULT NOW(),
        exited_at TIMESTAMPTZ,
        duration_minutes INTEGER,
        outcome TEXT,
        notes TEXT,
        performed_by UUID REFERENCES auth.users(id),
        data JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  }
];

// Additional workflow-related tables
const additionalTables = [
  {
    name: 'sourcing_quotas',
    sql: `
      CREATE TABLE IF NOT EXISTS sourcing_quotas (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        pod_id UUID REFERENCES pods(id),
        user_id UUID REFERENCES auth.users(id),
        job_id UUID REFERENCES jobs(id),
        quota_type TEXT CHECK (quota_type IN ('daily', 'weekly', 'monthly', 'job')),
        target_count INTEGER NOT NULL,
        current_count INTEGER DEFAULT 0,
        period_start DATE,
        period_end DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  },
  {
    name: 'production_line_view',
    sql: `
      CREATE TABLE IF NOT EXISTS production_line_view (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflow_instances(id),
        stage_name TEXT,
        items_count INTEGER DEFAULT 0,
        average_time_hours DECIMAL(10,2),
        bottleneck_score DECIMAL(5,2),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  },
  {
    name: 'bottleneck_alerts',
    sql: `
      CREATE TABLE IF NOT EXISTS bottleneck_alerts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        workflow_id UUID REFERENCES workflow_instances(id),
        stage_name TEXT,
        alert_type TEXT CHECK (alert_type IN ('slow', 'blocked', 'overload')),
        status TEXT CHECK (status IN ('open', 'resolved', 'ignored')) DEFAULT 'open',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        resolved_at TIMESTAMPTZ
      )
    `
  },
  {
    name: 'resume_database',
    sql: `
      CREATE TABLE IF NOT EXISTS resume_database (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        candidate_id UUID REFERENCES candidates(id),
        first_name TEXT,
        last_name TEXT,
        email TEXT,
        phone TEXT,
        current_title TEXT,
        years_experience INTEGER,
        skills TEXT[],
        education JSONB DEFAULT '[]'::jsonb,
        work_experience JSONB DEFAULT '[]'::jsonb,
        resume_text TEXT,
        resume_embedding VECTOR(1536),
        source TEXT,
        sourced_by UUID REFERENCES auth.users(id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `
  }
];

async function runMigration() {
  try {
    console.log('🚀 Starting Trikala Workflow migration...');
    
    let successCount = 0;
    let errorCount = 0;
    
    // Create workflow tables
    console.log('\n📊 Creating workflow tables...');
    for (const table of workflowTables) {
      try {
        const { data, error } = await supabase.from(table.name).select('count').limit(1);
        
        if (error && error.message.includes('not found')) {
          // Table doesn't exist, create it
          console.log(`Creating table: ${table.name}...`);
          // Note: Supabase doesn't support direct SQL execution via client
          // We'll need to use the SQL editor in Supabase Dashboard
          console.log(`✅ Table ${table.name} SQL prepared (needs manual execution)`);
          successCount++;
        } else {
          console.log(`✅ Table ${table.name} already exists`);
        }
      } catch (err) {
        console.log(`⚠️  Table ${table.name} - check required`);
        errorCount++;
      }
    }
    
    // Create additional tables
    console.log('\n📊 Creating additional tables...');
    for (const table of additionalTables) {
      try {
        const { data, error } = await supabase.from(table.name).select('count').limit(1);
        
        if (error && error.message.includes('not found')) {
          console.log(`✅ Table ${table.name} SQL prepared (needs manual execution)`);
          successCount++;
        } else {
          console.log(`✅ Table ${table.name} already exists`);
        }
      } catch (err) {
        console.log(`⚠️  Table ${table.name} - check required`);
        errorCount++;
      }
    }
    
    console.log('\n📊 Migration Summary:');
    console.log(`✅ Tables prepared: ${successCount}`);
    console.log(`⚠️  Tables to check: ${errorCount}`);
    
    // Generate SQL file for manual execution
    const allTables = [...workflowTables, ...additionalTables];
    const sqlContent = allTables.map(t => t.sql).join(';\n\n') + ';';
    const outputPath = path.join(process.cwd(), 'supabase/migrations/workflow_tables_manual.sql');
    
    fs.writeFileSync(outputPath, sqlContent);
    console.log(`\n📝 SQL file generated: ${outputPath}`);
    console.log('\n⚠️  IMPORTANT: Please run the generated SQL file in Supabase Dashboard:');
    console.log('1. Go to https://app.supabase.com/project/jbusreaeuxzpjszuhvre/sql');
    console.log('2. Copy the contents of workflow_tables_manual.sql');
    console.log('3. Paste and execute in the SQL editor');
    
    console.log('\n✨ Migration preparation completed!');
    
  } catch (error) {
    console.error('❌ Migration error:', error);
    process.exit(1);
  }
}

// Run the migration
runMigration();

