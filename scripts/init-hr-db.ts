#!/usr/bin/env tsx
/**
 * HR Database Initialization Script
 * Run this to set up the HR management system tables and seed data
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function initializeHRDatabase() {
  console.log('🚀 Starting HR Database initialization...\n');

  try {
    // Read the HR schema SQL file
    const schemaPath = path.join(process.cwd(), 'database', 'hr-schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Execute the schema
    console.log('📝 Applying HR database schema...');
    const { error: schemaError } = await supabase.rpc('exec_sql', { 
      query: schemaSql 
    }).single();

    if (schemaError) {
      // If RPC doesn't exist, try alternative method
      console.log('⚠️  Direct SQL execution not available, please run the schema manually in Supabase dashboard');
      console.log('📋 Schema file location: database/hr-schema.sql');
    } else {
      console.log('✅ HR database schema applied successfully');
    }

    // Create admin user and employee
    console.log('\n👤 Creating admin user account...');
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@intimesolutions.com',
      password: 'admin123456',
      email_confirm: true
    });

    if (authError && !authError.message.includes('already been registered')) {
      throw authError;
    }

    const userId = authData?.user?.id || 'existing-user';
    console.log('✅ Admin user created/exists');

    // Check if HR roles exist
    console.log('\n🔐 Checking HR roles...');
    const { data: roles, error: rolesError } = await supabase
      .from('hr_roles')
      .select('id, name')
      .eq('name', 'Admin')
      .single();

    if (rolesError || !roles) {
      console.log('⚠️  HR roles not found, please ensure the schema was applied');
    } else {
      console.log('✅ HR roles configured');

      // Create admin employee if user was created
      if (authData?.user) {
        console.log('\n👔 Creating admin employee record...');
        const { error: empError } = await supabase
          .from('employees')
          .insert({
            user_id: authData.user.id,
            employee_id: 'EMP2025001',
            first_name: 'System',
            last_name: 'Admin',
            email: 'admin@intimesolutions.com',
            designation: 'System Administrator',
            employment_type: 'Full-time',
            employment_status: 'Active',
            hire_date: new Date('2024-01-01').toISOString(),
            role_id: roles.id
          });

        if (empError && !empError.message.includes('duplicate')) {
          console.log('⚠️  Could not create admin employee:', empError.message);
        } else {
          console.log('✅ Admin employee created');
        }
      }
    }

    console.log('\n🎉 HR Database initialization complete!');
    console.log('\n📋 Next steps:');
    console.log('1. If schema wasn\'t applied automatically, run it in Supabase SQL Editor');
    console.log('2. Start the development server: npm run dev');
    console.log('3. Visit http://localhost:3000/portals (Portal Hub)');
    console.log('   OR directly: http://localhost:3000/hr/login');
    console.log('4. Login with: admin@intimesolutions.com / admin123456');

  } catch (error) {
    console.error('\n❌ Error during initialization:', error);
    process.exit(1);
  }
}

// Run the initialization
initializeHRDatabase();
