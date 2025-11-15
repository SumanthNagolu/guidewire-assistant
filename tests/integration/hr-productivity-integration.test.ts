/**
 * INTEGRATION TESTS: HR → Productivity Integration
 * Tests clock in/out and productivity tracking
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient } from '@/lib/supabase/server';
import { onClockIn, onClockOut } from '@/modules/hr/attendance-handler';

describe('HR → Productivity Integration', () => {
  let supabase: any;
  let testEmployee: any;
  let testUser: any;

  beforeAll(async () => {
    supabase = createClient();

    // Create test user
    const { data: user } = await supabase.auth.admin.createUser({
      email: 'test-employee-hr@test.com',
      password: 'Test123!@#',
      email_confirm: true
    });

    testUser = user;

    // Create user profile
    await supabase
      .from('user_profiles')
      .insert({
        id: testUser.id,
        full_name: 'Test Employee',
        email: testUser.email
      });

    // Create employee record
    const { data: employee } = await supabase
      .from('employee_records')
      .insert({
        user_id: testUser.id,
        employee_id: 'EMP-2025-TEST1',
        designation: 'Recruiter',
        employment_type: 'Full-time',
        employment_status: 'Active',
        hire_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    testEmployee = employee;
  });

  afterAll(async () => {
    // Cleanup
    if (testUser) {
      await supabase.auth.admin.deleteUser(testUser.id);
    }
  });

  it('should handle complete clock in/out flow', async () => {
    // STEP 1: Clock in
    await onClockIn(testEmployee.id);

    // VERIFY: Attendance record created
    const today = new Date().toISOString().split('T')[0];
    const { data: attendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', testEmployee.id)
      .eq('date', today)
      .single();

    expect(attendance).toBeDefined();
    expect(attendance.status).toBe('Present');
    expect(attendance.clock_in_time).toBeDefined();

    // VERIFY: Productivity session created
    const { data: session } = await supabase
      .from('productivity_sessions')
      .select('*')
      .eq('user_id', testUser.id)
      .is('end_time', null)
      .single();

    expect(session).toBeDefined();
    expect(session.start_time).toBeDefined();
    expect(session.session_type).toBe('work_day');

    // SIMULATE: Work day (add some screenshots for scoring)
    for (let i = 0; i < 10; i++) {
      await supabase
        .from('productivity_screenshots')
        .insert({
          user_id: testUser.id,
          session_id: session.id,
          screenshot_url: `https://example.com/screenshot-${i}.jpg`,
          captured_at: new Date().toISOString(),
          ai_analyzed: true,
          productivity_score: 80 + Math.random() * 20,
          focus_score: 75 + Math.random() * 25,
          work_category: 'coding'
        });
    }

    // Wait a bit for async operations
    await new Promise(resolve => setTimeout(resolve, 1000));

    // STEP 2: Clock out
    await onClockOut(testEmployee.id);

    // VERIFY: Attendance updated
    const { data: updatedAttendance } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', testEmployee.id)
      .eq('date', today)
      .single();

    expect(updatedAttendance.clock_out_time).toBeDefined();

    // VERIFY: Session ended
    const { data: endedSession } = await supabase
      .from('productivity_sessions')
      .select('*')
      .eq('id', session.id)
      .single();

    expect(endedSession.end_time).toBeDefined();

    // VERIFY: Productivity score calculated
    const { data: score } = await supabase
      .from('productivity_scores')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('date', today)
      .single();

    expect(score).toBeDefined();
    expect(score.score).toBeGreaterThan(0);
    expect(score.score).toBeLessThanOrEqual(100);

    // VERIFY: HR performance record updated
    const { data: performance } = await supabase
      .from('performance_history')
      .select('*')
      .eq('employee_id', testEmployee.id)
      .eq('date', today)
      .single();

    expect(performance).toBeDefined();
    expect(performance.productivity_score).toBe(score.score);

    // VERIFY: Notifications created (morning & EOD)
    const { data: notifications } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', testUser.id)
      .eq('category', 'productivity');

    expect(notifications.length).toBeGreaterThanOrEqual(2); // Morning + EOD
  });
});

