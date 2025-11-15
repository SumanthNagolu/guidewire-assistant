#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { unifiedUserService } from '@/lib/users/unified-user-service';
import { eventBus } from '@/lib/events/event-bus';

// Migration script to consolidate user data
async function migrateToUnifiedUsers() {
  console.log('Starting user data migration...');

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // Step 1: Get all auth users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) throw authError;
    
    console.log(`Found ${authUsers.users.length} auth users`);

    // Step 2: Process each user
    for (const authUser of authUsers.users) {
      console.log(`Processing user: ${authUser.email}`);

      // Check if user_profile exists
      const { data: existingProfile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();

      if (!existingProfile) {
        // Create user profile
        console.log(`Creating profile for ${authUser.email}`);
        
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authUser.id,
            email: authUser.email!,
            created_at: authUser.created_at,
            updated_at: authUser.updated_at,
          });

        if (profileError) {
          console.error(`Failed to create profile for ${authUser.email}:`, profileError);
          continue;
        }
      }

      // Step 3: Detect and assign roles based on existing data
      
      // Check if student
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (studentProfile) {
        await assignRoleIfNeeded(supabase, authUser.id, 'student');
      }

      // Check if employee
      const { data: employeeRecord } = await supabase
        .from('employee_records')
        .select('*')
        .eq('user_id', authUser.id)
        .single();

      if (employeeRecord) {
        // Determine specific role
        const role = employeeRecord.role || 'employee';
        await assignRoleIfNeeded(supabase, authUser.id, role);
      }

      // Check for admin in old user_profiles table
      const { data: oldProfile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', authUser.id)
        .single();

      if (oldProfile?.role === 'admin') {
        await assignRoleIfNeeded(supabase, authUser.id, 'admin');
      }

      // Step 4: Consolidate duplicate profiles
      await consolidateDuplicates(supabase, authUser.id, authUser.email!);
    }

    // Step 5: Clean up orphaned records
    await cleanupOrphanedRecords(supabase);

    // Step 6: Emit migration complete event
    await eventBus.emit('migration:users_consolidated', {
      totalUsers: authUsers.users.length,
      timestamp: new Date(),
    });

    console.log('User migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Helper function to assign role if not already assigned
async function assignRoleIfNeeded(
  supabase: any,
  userId: string,
  roleCode: string
) {
  // Get role ID
  const { data: role } = await supabase
    .from('roles')
    .select('id')
    .eq('code', roleCode)
    .single();

  if (!role) {
    console.error(`Role ${roleCode} not found`);
    return;
  }

  // Check if already assigned
  const { data: existing } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role_id', role.id)
    .single();

  if (!existing) {
    // Assign role
    const { error } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role_id: role.id,
        assigned_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`Failed to assign role ${roleCode} to user ${userId}:`, error);
    } else {
      console.log(`Assigned role ${roleCode} to user ${userId}`);
    }
  }
}

// Consolidate duplicate profiles
async function consolidateDuplicates(
  supabase: any,
  userId: string,
  email: string
) {
  // Find duplicates by email
  const { data: duplicates } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('email', email)
    .neq('id', userId);

  if (duplicates && duplicates.length > 0) {
    console.log(`Found ${duplicates.length} duplicate profiles for ${email}`);

    for (const duplicate of duplicates) {
      // Migrate data from duplicate to primary
      await migrateDuplicateData(supabase, duplicate.id, userId);

      // Delete duplicate
      await supabase
        .from('user_profiles')
        .delete()
        .eq('id', duplicate.id);

      console.log(`Merged duplicate ${duplicate.id} into ${userId}`);
    }
  }
}

// Migrate data from duplicate profile
async function migrateDuplicateData(
  supabase: any,
  fromUserId: string,
  toUserId: string
) {
  const tables = [
    'topic_completions',
    'quiz_attempts',
    'ai_conversations',
    'ai_messages',
    'productivity_sessions',
    'productivity_screenshots',
  ];

  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .update({ user_id: toUserId })
      .eq('user_id', fromUserId);

    if (error) {
      console.error(`Failed to migrate ${table} from ${fromUserId} to ${toUserId}:`, error);
    }
  }
}

// Clean up orphaned records
async function cleanupOrphanedRecords(supabase: any) {
  console.log('Cleaning up orphaned records...');

  // Delete student_profiles without valid user
  const { error: studentError } = await supabase
    .from('student_profiles')
    .delete()
    .is('user_id', null);

  if (studentError) {
    console.error('Failed to clean student_profiles:', studentError);
  }

  // Delete employee_records without valid user
  const { error: employeeError } = await supabase
    .from('employee_records')
    .delete()
    .is('user_id', null);

  if (employeeError) {
    console.error('Failed to clean employee_records:', employeeError);
  }

  console.log('Cleanup completed');
}

// Run migration
if (require.main === module) {
  migrateToUnifiedUsers();
}
