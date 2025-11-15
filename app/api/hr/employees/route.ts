/**
 * HR EMPLOYEES API
 * Unified employee management using integrated user system
 */

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { NextRequest, NextResponse } from 'next/server';
import { platformOrchestrator } from '@/lib/integration/platform-orchestrator';
import { loggers } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has HR permissions
    const userProfile = await platformOrchestrator.getUserCompleteProfile(user.id);
    const roles = userProfile?.roles || [];
    
    if (!roles.includes('hr') && !roles.includes('admin') && !roles.includes('manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const department = searchParams.get('department');
    const status = searchParams.get('status') || 'active';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = (page - 1) * limit;
    
    // Build query
    let query = supabase
      .from('user_profiles')
      .select(`
        *,
        user_roles(role_id, roles(code, name)),
        departments:department_id(name, code)
      `, { count: 'exact' })
      .not('employee_id', 'is', null)
      .eq('employment_status', status)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });
    
    if (department) {
      query = query.eq('department_id', department);
    }
    
    const { data, error, count } = await query;
    
    if (error) {
      loggers.api.error('Error fetching employees:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    
    // Transform data to include complete profiles
    const employees = await Promise.all(
      (data || []).map(async (employee) => {
        const completeProfile = await platformOrchestrator.getUserCompleteProfile(employee.id);
        return {
          ...employee,
          ...completeProfile,
          roles: employee.user_roles?.map((ur: any) => ur.roles?.name) || []
        };
      })
    );
    
    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    loggers.api.error('HR API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has HR permissions
    const userProfile = await platformOrchestrator.getUserCompleteProfile(user.id);
    const roles = userProfile?.roles || [];
    
    if (!roles.includes('hr') && !roles.includes('admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      employeeId,
      departmentId,
      designation,
      employmentType,
      hireDate,
      reportingManagerId,
      workLocation,
      salary
    } = body;
    
    // Create user account if doesn't exist
    let userId = body.userId;
    if (!userId) {
      const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2),
        email_confirm: true,
        user_metadata: {
          full_name: `${firstName} ${lastName}`
        }
      });
      
      if (authError) {
        loggers.api.error('Error creating auth user:', authError);
        return NextResponse.json({ error: authError.message }, { status: 400 });
      }
      
      userId = authUser.user.id;
    }
    
    // Update user profile with employee details
    const { data: employee, error: employeeError } = await adminClient
      .from('user_profiles')
      .upsert({
        id: userId,
        email,
        first_name: firstName,
        last_name: lastName,
        employee_id: employeeId,
        department_id: departmentId,
        designation,
        employment_type: employmentType,
        employment_status: 'active',
        hire_date: hireDate,
        reporting_manager_id: reportingManagerId,
        work_location: workLocation,
        role: 'employee',
        onboarding_completed: true
      })
      .select()
      .single();
    
    if (employeeError) {
      loggers.api.error('Error creating employee record:', employeeError);
      return NextResponse.json({ error: employeeError.message }, { status: 400 });
    }
    
    // Assign employee role
    const { data: employeeRole } = await adminClient
      .from('roles')
      .select('id')
      .eq('code', 'employee')
      .single();
    
    if (employeeRole) {
      await adminClient.from('user_roles').upsert({
        user_id: userId,
        role_id: employeeRole.id,
        assigned_by: user.id
      });
    }
    
    // Trigger system event for new hire
    await adminClient.from('system_events').insert({
      event_type: 'employee_hired',
      source_module: 'hr',
      target_modules: ['productivity', 'academy', 'platform'],
      payload: {
        user_id: userId,
        hire_date: hireDate,
        department_id: departmentId,
        created_by: user.id
      }
    });
    
    // Send welcome email (async)
    fetch('/api/hr/send-welcome-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, email })
    });
    
    loggers.api.info(`Employee created: ${employeeId} by ${user.email}`);
    
    return NextResponse.json({
      success: true,
      employee,
      message: 'Employee created successfully'
    });
  } catch (error) {
    loggers.api.error('HR API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const adminClient = createAdminClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if user has HR permissions
    const userProfile = await platformOrchestrator.getUserCompleteProfile(user.id);
    const roles = userProfile?.roles || [];
    
    if (!roles.includes('hr') && !roles.includes('admin') && !roles.includes('manager')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const body = await request.json();
    const { userId, updates } = body;
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }
    
    // Update employee record
    const { data: employee, error } = await adminClient
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();
    
    if (error) {
      loggers.api.error('Error updating employee:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    // If status changed, trigger appropriate events
    if (updates.employment_status) {
      await adminClient.from('system_events').insert({
        event_type: `employee_${updates.employment_status}`,
        source_module: 'hr',
        target_modules: ['productivity', 'platform'],
        payload: {
          user_id: userId,
          new_status: updates.employment_status,
          updated_by: user.id
        }
      });
    }
    
    loggers.api.info(`Employee updated: ${userId} by ${user.email}`);
    
    return NextResponse.json({
      success: true,
      employee,
      message: 'Employee updated successfully'
    });
  } catch (error) {
    loggers.api.error('HR API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
